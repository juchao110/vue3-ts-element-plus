import {
  fetch
} from '@/utils/promise';

// 冷库安全
export function queryCoolSafe(data:any) {
  return fetch({
    url: `/phmapi/coolsafe/queryCoolSafe`,
    method: "post",
    data
  });
}
