const getPixelRatio = () => {
  if (typeof window === 'undefined') {
    return 1
  }
  return window.devicePixelRatio || 1
}

const getDimensionKey = () => {
  if (typeof window === 'undefined') {
    return '0x0'
  }
  const { width, height } = window.screen
  return `${Math.max(width, height)}x${Math.min(width, height)}`
}

// Configuration object for OS detection
const OS_PATTERNS = [
  {
    pattern: /Windows NT/,
    name: 'Windows',
    versionRegex: /Windows NT ([\d.]+)/,
    versionTransform: null,
  },
  {
    pattern: /Mac OS X/,
    name: 'macOS',
    versionRegex: /Mac OS X ([\d_]+)/,
    versionTransform: version => version.replace(/_/g, '.'),
  },
  {
    pattern: /Android/,
    name: 'Android',
    versionRegex: /Android ([\d.]+)/,
    versionTransform: null,
  },
  {
    pattern: /iPhone|iPad|iPod/,
    name: 'iOS',
    versionRegex: /OS ([\d_]+)/,
    versionTransform: version => version.replace(/_/g, '.'),
  },
  {
    pattern: /Linux/,
    name: 'Linux',
    versionRegex: null,
    versionTransform: null,
  },
]

// iPhone model configurations
const IPHONE_MODELS = {
  3: {
    '932x430': 'iPhone 14 Pro Max / 15 Pro Max / 16 Pro Max',
    '926x428': 'iPhone 12 Pro Max / 13 Pro Max / 14 Plus / 15 Plus / 16 Plus',
    '896x414': 'iPhone 11 Pro Max / XS Max',
    '852x393': 'iPhone 14 Pro / 15 Pro / 16 Pro',
    '844x390': 'iPhone 12 / 12 Pro / 13 / 13 Pro / 14 / 15 / 16',
    '812x375': 'iPhone X / XS / 11 Pro / 12 mini / 13 mini',
  },
  2: {
    '736x414': 'iPhone 6 Plus / 6s Plus / 7 Plus / 8 Plus',
    '667x375': 'iPhone 6 / 6s / 7 / 8 / SE (2nd/3rd gen)',
    '568x320': 'iPhone 5 / 5s / 5c / SE (1st gen)',
  },
}

// iPad model configurations
const IPAD_MODELS = {
  2: {
    '1366x1024': 'iPad Pro 12.9"',
    '1194x834': 'iPad Pro 11"',
    '1112x834': 'iPad Pro 10.5"',
    '1024x768': 'iPad / iPad Air / iPad Mini',
  },
}

// Android device patterns
const ANDROID_PATTERNS = [
  {
    test: ua => /Samsung/i.test(ua) || /SM-/i.test(ua),
    manufacturer: 'Samsung',
    modelRegex: /SM-([A-Z0-9]+)/i,
    modelTransform: match => `Galaxy ${match[1]}`,
  },
  {
    test: ua => /Pixel/i.test(ua),
    manufacturer: 'Google',
    modelRegex: /Pixel( \d+)?( XL)?( Pro)?/i,
    modelTransform: match => match[0],
  },
  {
    test: ua => /OnePlus/i.test(ua),
    manufacturer: 'OnePlus',
    modelRegex: /OnePlus([A-Z0-9]+)/i,
    modelTransform: match => match[1],
  },
  {
    test: ua => /Mi |Redmi|POCO/i.test(ua),
    manufacturer: 'Xiaomi',
    modelRegex: /(Mi [A-Z0-9]+|Redmi [A-Z0-9 ]+|POCO [A-Z0-9 ]+)/i,
    modelTransform: match => match[1],
  },
  {
    test: ua => /Huawei|Honor/i.test(ua),
    manufacturer: 'Huawei',
    modelRegex: /(Huawei|Honor) ([A-Z0-9-]+)/i,
    modelTransform: match => match[2],
  },
]

// Configuration object for device detection
const DEVICE_PATTERNS = [
  {
    pattern: /iPhone/,
    getData: _userAgent => ({
      deviceType: 'Smartphone',
      manufacturer: 'Apple',
      model: detectiPhoneModel(),
    }),
  },
  {
    pattern: /iPad/,
    getData: _userAgent => ({
      deviceType: 'Tablet',
      manufacturer: 'Apple',
      model: detectiPadModel(),
    }),
  },
  {
    pattern: /Android/,
    getData: userAgent => ({
      deviceType: /Mobile/.test(userAgent) ? 'Smartphone' : 'Tablet',
      ...detectAndroidDevice(userAgent),
    }),
  },
  {
    pattern: /Macintosh/,
    getData: () => ({
      deviceType: 'Desktop/Laptop',
      manufacturer: 'Apple',
      model: 'Mac',
    }),
  },
  {
    pattern: /Windows/,
    getData: () => ({
      deviceType: 'Desktop/Laptop',
      manufacturer: 'PC',
      model: 'Windows PC',
    }),
  },
  {
    pattern: /Linux/,
    getData: () => ({
      deviceType: 'Desktop/Laptop',
      manufacturer: 'Unknown',
      model: 'Linux PC',
    }),
  },
]

// Configuration object for browser detection
const BROWSER_PATTERNS = [
  {
    test: ua => /Edg/.test(ua),
    name: 'Edge',
    versionRegex: /Edg\/([\d.]+)/,
  },
  {
    test: ua => /Chrome/.test(ua) && !/Edg/.test(ua),
    name: 'Chrome',
    versionRegex: /Chrome\/([\d.]+)/,
  },
  {
    test: ua => /Safari/.test(ua) && !/Chrome/.test(ua),
    name: 'Safari',
    versionRegex: /Version\/([\d.]+)/,
  },
  {
    test: ua => /Firefox/.test(ua),
    name: 'Firefox',
    versionRegex: /Firefox\/([\d.]+)/,
  },
]

const detectDevice = () => {
  if (typeof window === 'undefined' || typeof navigator === 'undefined') {
    return {
      userAgent: 'N/A',
      platform: 'N/A',
      screenResolution: '0x0',
      pixelRatio: 1,
      touchSupport: false,
      os: 'Unknown',
      osVersion: 'Unknown',
      deviceType: 'Unknown',
      manufacturer: 'Unknown',
      model: 'Unknown',
      browser: 'Unknown',
      browserVersion: 'Unknown',
    }
  }

  const { userAgent, platform } = navigator
  const { width, height } = window.screen
  const pixelRatio = getPixelRatio()

  return {
    userAgent,
    platform,
    screenResolution: `${width}x${height}`,
    pixelRatio,
    touchSupport: 'ontouchstart' in window || navigator.maxTouchPoints > 0,
    ...detectOS(userAgent),
    ...detectDeviceType(userAgent),
    ...detectBrowser(userAgent),
  }
}

const detectOS = userAgent => {
  const osMatch = OS_PATTERNS.find(os => os.pattern.test(userAgent))
  const versionMatch = osMatch && osMatch.versionRegex && userAgent.match(osMatch.versionRegex)
  const defaultTransform = v => v

  return osMatch
    ? {
        os: osMatch.name,
        osVersion: (versionMatch && (osMatch.versionTransform || defaultTransform)(versionMatch[1])) || 'Unknown',
      }
    : { os: 'Unknown', osVersion: 'Unknown' }
}

const detectDeviceType = userAgent => {
  const foundPattern = DEVICE_PATTERNS.find(device => device.pattern.test(userAgent))
  if (foundPattern) {
    return foundPattern.getData(userAgent)
  }
  return {
    deviceType: 'Unknown',
    manufacturer: 'Unknown',
    model: 'Unknown',
  }
}

const detectBrowser = userAgent => {
  const browserMatch = BROWSER_PATTERNS.find(browser => browser.test(userAgent))
  const versionMatch = browserMatch && userAgent.match(browserMatch.versionRegex)

  return browserMatch
    ? {
        browser: browserMatch.name,
        browserVersion: (versionMatch && versionMatch[1]) || 'Unknown',
      }
    : { browser: 'Unknown', browserVersion: 'Unknown' }
}

const detectiPhoneModel = () => {
  const pixelRatio = getPixelRatio()
  const models = IPHONE_MODELS[pixelRatio]
  const dimensionKey = getDimensionKey()
  return (models && models[dimensionKey]) || 'iPhone'
}

const detectiPadModel = () => {
  const pixelRatio = getPixelRatio()
  const models = IPAD_MODELS[pixelRatio]
  const dimensionKey = getDimensionKey()
  return (models && models[dimensionKey]) || 'iPad'
}

const detectAndroidDevice = userAgent => {
  const matchedPattern = ANDROID_PATTERNS.find(pattern => pattern.test(userAgent))
  const modelMatch = matchedPattern && userAgent.match(matchedPattern.modelRegex)
  const genericMatch = userAgent.match(/Android.*;\s*([^)]+)\s*Build/)

  return matchedPattern
    ? {
        manufacturer: matchedPattern.manufacturer,
        model: (modelMatch && matchedPattern.modelTransform(modelMatch)) || 'Unknown',
      }
    : {
        manufacturer: 'Android',
        model: (genericMatch && genericMatch[1] && genericMatch[1].trim()) || 'Unknown',
      }
}

// Auto-populate on document load
// Update element id according to your need
// Remove console.log in production
if (typeof document !== 'undefined') {
  document.addEventListener('DOMContentLoaded', () => {
    const input = document.getElementById('device-data')
    const deviceInfo = detectDevice()
    if (input) {
      input.value = JSON.stringify(deviceInfo)
    }
  })
}
