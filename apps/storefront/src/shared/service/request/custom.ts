const originFetch = window.fetch;

const responseResult = (path: string, res: any, resolve: any, init: any) => {
  if (path.includes('current.jwt')) return res.text();

  if (init.method === 'DELETE') {
    resolve();
  }
  return res.json();
};

function nsFetch(path: string, init: any) {
  return new Promise((resolve, reject) => {
    originFetch(path, init)
      .then((res: Response) => responseResult(path, res, resolve, init))
      .then(async (res) => {
        if (res?.code === 500) {
          const data = res?.data || {};
          const message = data.errMsg || res.message || '';
          reject(message);
          return;
        }
        resolve(res?.data);
      })
      .catch((err: Error) => {
        reject(err);
      });
  });
}
export default nsFetch;
