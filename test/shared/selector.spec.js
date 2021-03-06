import { select } from '@/shared/utils'

describe('select', () => {
  test('select takes only few from data', done => {
    const data = {
      name: 'Brian Cohen',
      email: 'brightside@life.com',
      course: 'cbcc',
      isActive: true
    }
    const paramList = ['name', 'course', 'isActive']
    const result = select(data, paramList)
    expect(result).toEqual({
      name: 'Brian Cohen',
      course: 'cbcc',
      isActive: true
    })
    done()
  })

  test('select takes paramList longer than data', done => {
    const data = {
      name: 'Brian Cohen',
      email: 'brightside@life.com',
      course: 'cbcc',
      isActive: true
    }
    const paramList = ['name', 'course', 'isActive', 'isConcluding']
    const result = select(data, paramList)
    expect(result).toEqual({
      name: 'Brian Cohen',
      course: 'cbcc',
      isActive: true
    })
    done()
  })

  test('select writes defaults into data', done => {
    const data = {
      name: 'Brian Cohen',
      email: 'brightside@life.com',
      course: 'cbcc',
      isActive: true
    }
    const paramList = ['name', 'course']
    const result = select(data, paramList, {
      page: 1,
      order: 'asc'
    })
    expect(result).toEqual({
      name: 'Brian Cohen',
      course: 'cbcc',
      page: 1,
      order: 'asc'
    })
    done()
  })

  test('data overwrites select', done => {
    const data = {
      page: 2,
      course: 'cbcc',
      isActive: true
    }
    const paramList = ['page', 'course', 'isActive']
    const result = select(data, paramList, {
      page: 1,
      order: 'asc'
    })
    expect(result).toEqual({
      page: 2,
      course: 'cbcc',
      isActive: true,
      order: 'asc'
    })
    done()
  })
})
