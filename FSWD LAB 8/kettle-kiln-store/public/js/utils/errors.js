import { toast } from '../views/toast.js';
import { redirectToLogin } from './nav.js';

// 401 -> send the visitor to log in (and back); anything else -> toast.
export function handleApiError(err, nextPage) {
  if (err.status === 401) return redirectToLogin(nextPage);
  toast(err.message || 'Something went wrong');
}
