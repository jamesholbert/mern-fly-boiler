export const DEV_MODE = process.env.NODE_ENV !== 'production'

export const DOMAIN = DEV_MODE ? 'http://localhost:8080/' : '/'

export const parseUrl = url => {
  const args = url.split('?')[1].split('&')

  const parsedArgs = {}
  for(let a in args){
    const [ k, v ] = args[a].split('=')
    parsedArgs[k] = v
  }

  return parsedArgs
}