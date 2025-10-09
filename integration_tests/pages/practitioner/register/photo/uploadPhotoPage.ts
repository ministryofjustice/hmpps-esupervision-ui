import Page, { PageElement } from '../../../page'

export default class UploadPhotoPage extends Page {
  constructor() {
    super('Upload a photo')
  }

  fileUploadInput = (): PageElement => cy.get('#photoUpload-input')

  uploadPhotoButton = (): PageElement => cy.contains('button', 'Upload photo')

  uploadPhoto = (fixturePath: string): void => {
    this.fileUploadInput().selectFile(`integration_tests/fixtures/${fixturePath}`, { force: true })
  }
}
