// const PDFDocument = require('pdfkit')
const fs = require('fs')
const htmlPdf = require('html-pdf')
const CatalogCard = require('../models/CatalogCard')
const KnowledgeArea = require('../models/KnowledgeArea')
const Course = require('../models/Course')
const AcademicUnity = require('../models/AcademicUnity')

const mailer = require('../util/catalogCardEmail')

const { validatePayload, chunks } = require('../../shared/utils')
const {
  cutterFetch,
  payloadErrors,
  labelMap,
  sha256
} = require('../util/utils')

const HttpCodes = require('../httpCodes')
const MessageCodes = require('../../shared/messageCodes')
const { catalogFields, querieFields } = require('../routeFieldsValidation')
const globalPdfConfig = require('../models/pdfdocs/globalPdfConfig')

const catalogCardModel = require('../models/pdfdocs/catalogCard')
const generatePdfReport = require('../models/pdfdocs/report')

// Usado para guardar as operações realizadas por cada usuário no sistema
// Previne condições de corrida
const pdfResults = {}
let userEmailV = ''

async function create(ctx) {
  // Validação interna do payload
  const {
    keywords,
    userEmail,
    work,
    authors,
    advisors,
    academicDetails,
    cotutorship,
    catalogFont
  } = ctx.request.body

  userEmailV = userEmail
  const validations = [
    // validatePayload(
    //   authors,
    //   catalogFields.authors.mandatory,
    //   catalogFields.authors.optional
    // ),
    validatePayload(
      work,
      catalogFields.work.mandatory,
      catalogFields.work.optional
    ),
    // validatePayload(
    //   advisors,
    //   catalogFields.advisors.mandatory,
    //   catalogFields.advisors.optional
    // ),
    validatePayload(academicDetails, catalogFields.academicDetails)
  ]

  if (
    !validations.every(val => val.valid) ||
    !catalogFields.fonts.includes(catalogFont) ||
    !keywords.length
  ) {
    ctx.throw(HttpCodes.BAD_REQUEST, MessageCodes.error.errInvalidFields, {
      fields: validations.filter(val => val && val.valid === false)
    })
  }

  const kna = await KnowledgeArea.where({
    id: academicDetails.knAreaId
  }).fetch()
  const cdd = kna.get('code')

  const course = await Course.where({
    id: academicDetails.courseId
  }).fetch()

  const acdUnity = await AcademicUnity.where({
    id: academicDetails.acdUnityId
  }).fetch()

  const academicDetailNames = {
    programName: course.get('name'),
    acdUnityName: acdUnity.get('name')
  }

  const cutter = cutterFetch(authors.authorSurname, work.workTitle)
  try {
    const payload = {
      type: work.workType,
      unityId: academicDetails.acdUnityId,
      courseId: academicDetails.courseId
    }
    const newCatalogCard = await CatalogCard.forge(payload).save()
    ctx.set('Content-Type', 'application/pdf')
    ctx.set('Content-Disposition', `filename=ficha.pdf`)
    ctx.status = HttpCodes.OK
    const id = newCatalogCard.id

    pdfResults[id] = {
      catalogFont,
      cutter,
      authors,
      work,
      advisors,
      academicDetailNames,
      keywords,
      cotutorship,
      cdd
    }
    ctx.set('PDF-Location', `/api/catalogCards/get/${id}`)
  } catch (e) {
    ctx.throw(HttpCodes.BAD_REQUEST, MessageCodes.error.errOnDbSave, {
      error: {
        rawErrorMessage: e.stack
      }
    })
  }
}

async function getPdfResult(ctx) {
  const { id } = ctx.params
  const pdfResult = pdfResults[id]
  const { catalogFont } = pdfResult
  if (!pdfResult) {
    ctx.status = HttpCodes.NOT_FOUND
    ctx.body = 'PDF already downloaded, please close this window.'
    return
  }
  ctx.set('Content-Type', 'application/pdf')
  ctx.set('Content-Disposition', `filename=ficha.pdf`)

  // Construir o PDF
  const htmlTemplate = catalogCardModel(catalogFont, pdfResult)
  const stream = await new Promise((resolve, reject) => {
    htmlPdf
      .create(htmlTemplate, {
        ...globalPdfConfig,
        border: {
          top: '4.25cm',
          bottom: '4.25cm',
          // Deixando que o HTML decida as margens horizontal para melhor
          // controle da largura do `card-body`
          right: '0',
          left: '0'
        }
      })
      .toStream((err, stream) => {
        if (err) {
          stream.close()
          reject(err)
        }
        stream.pipe(fs.createWriteStream('./assets/pdf_location/ficha.pdf'))
        mailer(userEmailV, 'ficha.pdf', './assets/pdf_location/ficha.pdf')
        resolve(stream)
      })
  })

  // delete pdfResults[id]
  ctx.body = stream
  ctx.status = HttpCodes.OK
}

// Usado para guardar as queries realizadas por cada usuário no sistema
// Previne condições de corrida
const queryResults = {}

async function catalogQueries(ctx) {
  const query = CatalogCard
  const searchType = ctx.query.searchType
  const params = ctx.request.body

  const { mandatory, optional } = querieFields[searchType]
  const validation = validatePayload(params, mandatory, optional)

  if (!validation.valid) {
    payloadErrors(ctx, validation)
  }

  // ano é obrigatório (ex: 2019 (number))
  // semester = 0 ou 1 (1º ou 2º semestre, respectivamente)
  // month = número em [0, ..., 11]
  const { year, semester, month, unityId, type, courseId } = params

  console.log('Semester:' + semester)

  // Primeiro filtrar por tipo, programa ou unidade acadêmica
  const optionalFilters = {
    ...(unityId && { unityId }),
    ...(type && { type }),
    ...(courseId && { courseId })
  }

  // months = [0, ..., 11]
  const months = Array.from({ length: 12 }, (_, i) => i)
  // Períodos requisitáveis: (mensal, semestral ou anual)
  const chunkSizeConvert = {
    monthly: 1,
    semiannually: 6,
    annually: 12
  }

  let responseObj = {}
  // Filtre e conte por mês, semestre ou ano inteiro.
  if (!isNaN(month)) {
    responseObj = await fetchMonthCount(query, year, month, optionalFilters)
  } else if (
    searchType === 'firstSemester' ||
    searchType === 'secondSemester'
  ) {
    console.log('called')

    const semesterIndex = searchType === 'firstSemester' ? 0 : 1

    const groupedMonths = chunks(months, chunkSizeConvert.semiannually)

    const initialMonth = groupedMonths[semesterIndex][0]

    console.log('Course ID: ' + courseId)
    if (!isNaN(unityId)) {
      const count = await fetchMonthGroupCount(
        query,
        year,
        groupedMonths[semesterIndex],
        optionalFilters
      )

      responseObj = { '1': count }
    } else {
      responseObj = await fetchSemesterGroupByAcdUnity(
        query,
        year,
        initialMonth,
        optionalFilters
      )
    }
  } else if (!isNaN(unityId) || searchType === 'monthly') {
    const groupedMonths = chunks(months, chunkSizeConvert[searchType])
    for (const groupIdx in groupedMonths) {
      const f = await fetchMonthGroupCount(
        query,
        year,
        groupedMonths[groupIdx],
        optionalFilters
      )
      // increment KEY to prevent left shifting and guarantee that 1 -> jan, 2 -> fev etc
      responseObj[parseInt(groupIdx) + 1 + ''] = f
    }
  } else {
    responseObj = await fetchAllGroupByAcdUnity(query, year, optionalFilters)
  }

  console.log(responseObj)
  const user = ctx.cookies.get('user')
  const xsrfToken = ctx.headers['x-xsrf-token']
  const pdfToken = sha256(user + xsrfToken + Date.now())
  ctx.set('pdfToken', pdfToken)

  ctx.status = HttpCodes.OK
  queryResults[pdfToken] = { params, searchType }
  queryResults[pdfToken].data = responseObj
  ctx.body = responseObj
}

/**
 *
 * @param {CatalogCard} query
 * @param {number} year
 * @param {Number[]} monthList
 * @returns {number} contagem de ocorrências de fichas catalográficas
 */
async function fetchMonthGroupCount(query, year, monthList, filters) {
  let count = 0
  for (let i = 0; i < monthList.length; i++) {
    const t = await fetchMonthCount(query, year, monthList[i], filters)
    count += t
  }
  // console.log(count)
  return count
}

/**
 *
 * @param {CatalogCard} query
 * @param {number} year
 * @param {number} month: número entre 0 e 11
 * @returns {Promise<Number>}
 */
function fetchMonthCount(query, year, month, filters) {
  month = +month
  const monthInitialDay = new Date(year, month).toISOString()
  // console.log(monthInitialDay)
  const monthFinalDay = new Date(year, month + 1, 0).toISOString()
  return query
    .where({ ...filters })
    .where('datetime', '>=', monthInitialDay)
    .where('datetime', '<=', monthFinalDay)
    .count()
}

// TODO
async function fetchSemesterGroupByAcdUnity(
  query,
  year,
  initialMonth,
  filters
) {
  // const initialMonth = monthList[0] === 0 ? 0 : 6
  const finalMonth = initialMonth === 0 ? 6 : 12

  const firstDayOfSemester = new Date(year, initialMonth).toISOString()
  // console.log(firstDayOfSemester)
  const lastDayOfSemester = new Date(year, finalMonth, 0).toISOString()
  // console.log(lastDayOfSemester)

  const all = await query
    .where({ ...filters })
    .where('datetime', '>=', firstDayOfSemester)
    .where('datetime', '<=', lastDayOfSemester)
    .fetchAll()

  const group = all.groupBy('unityId')
  const payload = {}
  const acdUnities = await AcademicUnity.fetchAll()

  for (const i in acdUnities.toJSON()) {
    const key = parseInt(i) + 1 + ''

    payload[key] = group[key] ? group[key].length : 0
  }
  return payload
}

async function fetchAllGroupByAcdUnity(query, year, filters) {
  console.log('aight')
  const firstDayOfYear = new Date(year, 0).toISOString()
  const lastDayOfYear = new Date(year, 12, 0).toISOString()
  const all = await query
    .where({ ...filters })
    .where('datetime', '>=', firstDayOfYear)
    .where('datetime', '<=', lastDayOfYear)
    .fetchAll()
  const group = all.groupBy('unityId')
  const payload = {}
  const acdUnities = await AcademicUnity.fetchAll()

  for (const i in acdUnities.toJSON()) {
    const key = parseInt(i) + 1 + ''

    payload[key] = group[key] ? group[key].length : 0
  }
  return payload
}

async function list(ctx) {
  try {
    ctx.body = await CatalogCard.forge()
      .orderBy('datetime', 'ASC')
      .fetchAll()
  } catch (e) {
    ctx.throw(HttpCodes.BAD_REQUEST, MessageCodes.error.errOnDbFetch, {
      error: {
        rawErrorMessage: e.stack
      }
    })
  }
}

async function update(ctx) {
  const id = +ctx.params.id
  const payload = ctx.request.body
  let catalogCard = await CatalogCard.where({ id }).fetch()
  if (catalogCard) {
    try {
      catalogCard = await CatalogCard.where({ id }).save(payload, {
        patch: true
      })
      ctx.body = catalogCard
      ctx.status = HttpCodes.OK
    } catch (e) {
      ctx.throw(HttpCodes.INT_SRV_ERROR, MessageCodes.error.errOnDbSave, {
        error: {
          rawErrorMessage: e.stack
        }
      })
    }
  } else {
    ctx.throw(
      HttpCodes.BAD_REQUEST,
      MessageCodes.error.errEntityDoesNotExist('CatalogCard')
    )
  }
}

async function getFirstCatalogCardYear(ctx) {
  try {
    const resultCollection = await CatalogCard.forge()
      .orderBy('datetime', 'ASC')
      .fetchAll()
    const oldest = resultCollection.first()
    ctx.body = {
      year: new Date(oldest.get('datetime')).getFullYear()
    }
  } catch (e) {
    ctx.throw(HttpCodes.BAD_REQUEST, MessageCodes.error.errOnDbFetch, {
      error: {
        rawErrorMessage: e.stack
      }
    })
  }
}

async function getReportPdf(ctx) {
  const { pdfToken } = ctx.query

  if (!queryResults[pdfToken] || !pdfToken) {
    ctx.body = 'No data to for you to see here, close this window...'
    ctx.status = HttpCodes.BAD_REQUEST
    return
  }

  ctx.set('Content-Type', 'application/pdf')
  ctx.set('Content-Disposition', 'filename=relatório.pdf')

  const queryResult = queryResults[pdfToken]
  const acdUnities =
    !queryResult.params.unityId && (await AcademicUnity.fetchAll()).toJSON()

  const { searchType, data } = queryResult

  const table = []

  console.log('search type:' + searchType)

  const labels = labelMap(acdUnities)[searchType] // [ name, acronym]

  for (const i in labels) {
    const data_key = parseInt(i) + 1 + ''

    const row = Array.isArray(labels[i])
      ? [...labels[i], '' + data[data_key]]
      : [labels[i], '' + data[data_key]]
    table.push(row)
  }
  // Sort descending first
  const last = table[0].length - 1
  queryResult.table = table.sort((rowA, rowB) => rowB[last] - rowA[last])
  if (!(searchType === 'annually') || !queryResult.params.unityId) {
    const values = Object.values(data)
    queryResult.total = values.reduce((acc, cur) => acc + cur)
    if (searchType === 'monthly' || !queryResult.params.unityId) {
      queryResult.mean = (queryResult.total / values.length).toPrecision(3)
    }
  }

  console.log(queryResult)

  const htmlTemplate = generatePdfReport(
    queryResult,
    !!queryResult.params.unityId
  )
  const stream = await new Promise((resolve, reject) => {
    htmlPdf.create(htmlTemplate, globalPdfConfig).toStream((err, stream) => {
      if (err) reject(err)
      resolve(stream)
    })
  })
  ctx.body = stream
  // delete queryResults[pdfToken]
  ctx.status = HttpCodes.OK
}

module.exports = {
  create,
  list,
  update,
  getPdfResult,
  catalogQueries,
  getFirstCatalogCardYear,
  getReportPdf
}
