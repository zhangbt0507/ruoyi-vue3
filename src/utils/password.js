/**
 * 口令强度校验（省分行口令规范 / 弱口令规则）
 * 与后端 PasswordValidator 保持一致，返回人性化提示；通过返回 null
 */

export const PWD_MIN_LENGTH = 10
export const PWD_MAX_LENGTH = 20
export const PWD_SPECIAL_CHARS = '!@#$%^&*'

const DEFAULT_PASSWORDS = new Set(['root', 'password', 'administor', 'administrator', 'admin'])

const WEAK_PATTERNS = [
  'qweasdzxc', '1qaz2wsx', 'qwer', 'asdf', 'zxcv', 'qwerty',
  '147258', '123456', '654321', 'abcdef', 'abc', 'aaa', '111111'
]

const KEYBOARD_ROWS = [
  '`1234567890-=',
  'qwertyuiop[]\\',
  'asdfghjkl;\'',
  'zxcvbnm,./',
  '~!@#$%^&*()_+',
  'QWERTYUIOP{}|',
  'ASDFGHJKL:"',
  'ZXCVBNM<>?'
]

const KEYBOARD_COLS = [
  '1qaz', '2wsx', '3edc', '4rfv', '5tgb', '6yhn', '7ujm', '8ik,', '9ol.', '0p;/',
  '!QAZ', '@WSX', '#EDC', '$RFV', '%TGB', '^YHN', '&UJM', '*IK<', '(OL>', ')P:?'
]

function isLetterOrDigit(c) {
  return (c >= 'a' && c <= 'z') || (c >= '0' && c <= '9')
}

function sameType(a, b) {
  const aLetter = a >= 'a' && a <= 'z'
  const bLetter = b >= 'a' && b <= 'z'
  const aDigit = a >= '0' && a <= '9'
  const bDigit = b >= '0' && b <= '9'
  return (aLetter && bLetter) || (aDigit && bDigit)
}

function containsAdjacentSequence(password, line, length) {
  if (line.length < length) {
    return false
  }
  for (let i = 0; i <= line.length - length; i++) {
    if (password.includes(line.substring(i, i + length))) {
      return true
    }
  }
  return false
}

function containsSequentialChars(password) {
  const lower = password.toLowerCase()
  for (let i = 0; i < lower.length - 2; i++) {
    const c1 = lower.charCodeAt(i)
    const c2 = lower.charCodeAt(i + 1)
    const c3 = lower.charCodeAt(i + 2)
    const ch1 = lower.charAt(i)
    const ch2 = lower.charAt(i + 1)
    const ch3 = lower.charAt(i + 2)
    if (ch1 === ch2 && ch2 === ch3) {
      return true
    }
    if (isLetterOrDigit(ch1) && isLetterOrDigit(ch2) && isLetterOrDigit(ch3)
      && sameType(ch1, ch2) && sameType(ch2, ch3)) {
      if ((c2 === c1 + 1 && c3 === c2 + 1) || (c2 === c1 - 1 && c3 === c2 - 1)) {
        return true
      }
    }
  }
  return false
}

function containsKeyboardPattern(password) {
  const lower = password.toLowerCase()
  for (const row of KEYBOARD_ROWS) {
    const line = row.toLowerCase()
    const reversed = line.split('').reverse().join('')
    if (containsAdjacentSequence(lower, line, 3) || containsAdjacentSequence(lower, reversed, 3)) {
      return true
    }
  }
  for (const col of KEYBOARD_COLS) {
    const line = col.toLowerCase()
    const reversed = line.split('').reverse().join('')
    if (containsAdjacentSequence(lower, line, 3) || containsAdjacentSequence(lower, reversed, 3)) {
      return true
    }
  }
  return false
}

function containsWeakPattern(lowerPwd) {
  return WEAK_PATTERNS.some(p => lowerPwd.includes(p))
}

/**
 * @param {string} password 明文密码
 * @param {string} [username] 用户名/柜员号
 * @returns {string|null} 错误提示，通过返回 null
 */
export function validatePassword(password, username) {
  if (!password) {
    return '新密码不能为空，请重新输入'
  }
  if (password.length < PWD_MIN_LENGTH) {
    return `密码长度不能少于${PWD_MIN_LENGTH}位，请设置更长的密码`
  }
  if (password.length > PWD_MAX_LENGTH) {
    return `密码长度不能超过${PWD_MAX_LENGTH}位，请缩短后重试`
  }

  let hasUpper = false
  let hasLower = false
  let hasDigit = false
  let hasSpecial = false
  for (let i = 0; i < password.length; i++) {
    const c = password.charAt(i)
    if (c >= 'A' && c <= 'Z') {
      hasUpper = true
    } else if (c >= 'a' && c <= 'z') {
      hasLower = true
    } else if (c >= '0' && c <= '9') {
      hasDigit = true
    } else if (PWD_SPECIAL_CHARS.indexOf(c) >= 0) {
      hasSpecial = true
    }
  }

  if (!hasUpper) {
    return '密码缺少大写字母，请至少包含一个大写字母（A-Z）'
  }
  if (!hasLower) {
    return '密码缺少小写字母，请至少包含一个小写字母（a-z）'
  }
  if (!hasDigit) {
    return '密码缺少数字，请至少包含一个数字（0-9）'
  }
  if (!hasSpecial) {
    return '密码缺少特殊符号，请至少包含一个特殊符号（!@#$%^&*）'
  }

  const lowerPwd = password.toLowerCase()
  if (DEFAULT_PASSWORDS.has(lowerPwd)) {
    return '密码不能使用系统默认口令（如 admin、password、root 等），请重新设置'
  }

  if (username) {
    const lowerName = String(username).toLowerCase()
    if (lowerName && lowerPwd.includes(lowerName)) {
      return '密码不能包含用户名（柜员号），请重新设置'
    }
  }

  if (containsSequentialChars(password) || containsKeyboardPattern(password) || containsWeakPattern(lowerPwd)) {
    return '密码不能包含连续字母、连续数字或键盘相邻字符（如 abc、123、qwer、1qaz 等），请重新设置'
  }

  return null
}

/**
 * Element Plus 表单校验器工厂
 * @param {() => string} [getUsername]
 */
export function passwordFormRule(getUsername) {
  return {
    validator: (rule, value, callback) => {
      const msg = validatePassword(value, typeof getUsername === 'function' ? getUsername() : getUsername)
      if (msg) {
        callback(new Error(msg))
      } else {
        callback()
      }
    },
    trigger: 'blur'
  }
}
