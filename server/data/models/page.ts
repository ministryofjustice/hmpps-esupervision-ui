import PageInfo from './pageInfo'

export default class Page<T> {
  pagination: PageInfo

  content: T[]
}
