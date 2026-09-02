import { HttpErrorResponse } from '@angular/common/http';
import { ValidationErrors } from './models/api.model';

interface ApiErrorBody {
  message?: string;
  errors?: ValidationErrors;
}

export function apiErrorMessage(error: unknown): string {
  if (!(error instanceof HttpErrorResponse)) {
    return 'Não foi possível concluir a operação.';
  }

  if (error.status === 0) {
    return 'Não foi possível conectar à API.';
  }

  const body = error.error as ApiErrorBody | null;
  return body?.message ?? 'Não foi possível concluir a operação.';
}

export function apiValidationErrors(error: unknown): ValidationErrors {
  if (!(error instanceof HttpErrorResponse)) {
    return {};
  }

  const body = error.error as ApiErrorBody | null;
  return body?.errors ?? {};
}
