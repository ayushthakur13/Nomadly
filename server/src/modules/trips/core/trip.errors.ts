export const TRIP_ERRORS = {
  TRIP_NOT_FOUND: 'TRIP_NOT_FOUND',
  UNAUTHORIZED: 'UNAUTHORIZED_TRIP_ACCESS',
  INVALID_DATES: 'INVALID_TRIP_DATES',
  ALREADY_MEMBER: 'MEMBER_ALREADY_JOINED',
  BUDGET_ALREADY_EXISTS: 'BUDGET_ALREADY_EXISTS',
  BUDGET_NOT_FOUND: 'BUDGET_NOT_FOUND',
  INVALID_INPUT: 'INVALID_INPUT'
} as const;

export type TripErrorCode = typeof TRIP_ERRORS[keyof typeof TRIP_ERRORS];

export class TripError extends Error {
  code: TripErrorCode;
  statusCode: number;

  constructor(code: TripErrorCode, message: string, statusCode = 400) {
    super(message);
    this.name = 'TripError';
    this.code = code;
    this.statusCode = statusCode;
  }
}
