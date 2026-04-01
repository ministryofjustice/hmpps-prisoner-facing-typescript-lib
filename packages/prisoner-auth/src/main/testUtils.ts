// eslint-disable-next-line import/no-extraneous-dependencies
import jwt from 'jsonwebtoken'

export const aJwtOf = (obj: object): string => jwt.sign(obj, 'secret')

export const aUserWith = ({ idTokenExp, refreshTokenExp }: { idTokenExp: number; refreshTokenExp: number }) => ({
  idToken: { exp: idTokenExp, iat: 123_456_789, sub: 'USER_A' },
  refreshToken: aJwtOf({ exp: refreshTokenExp, iat: 123_456_789, sub: 'USER_A' }),
  accessToken: aJwtOf({ exp: refreshTokenExp, iat: 123_456_789, sub: 'USER_A' }),
})
