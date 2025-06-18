export default function userFriendlyStrings(input: string): string {
  switch (input) {
    case 'yes':
      return 'Yes'
    case 'no':
      return 'No'
    case 'none':
      return 'None of my circumstances have changed'
    case 'homeAddress':
      return 'Home address'
    case 'employmentStatus':
      return 'Employment status'
    case 'supportSystem':
      return 'Support system'
    case 'contactDetails':
      return 'Contact details'
    case 'increased':
      return 'It has increased'
    case 'same':
      return 'It has stayed the same'
    case 'decreased':
      return 'It has decreased'
    case 'no-alcohol':
      return 'I do not drink alcohol'
    case 'no-drugs':
      return 'I do not take drugs'
    case '1to4':
      return '1 to 4 units'
    case '5to8':
      return '5 to 8 units'
    case '9to13':
      return '9 to 13 units'
    case '14ormore':
      return '14 or more units'
    case 'veryWell':
      return 'Very well'
    case 'well':
      return 'Well'
    case 'ok':
      return 'OK'
    case 'notGreat':
      return 'Not great'
    case 'struggling':
      return 'Struggling'
    case 'email':
      return 'Email'
    case 'text':
      return 'Text message'
    case 'both':
      return 'Both'
    default:
      return input
  }
}
