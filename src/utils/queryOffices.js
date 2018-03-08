const queryFS = (esriJS, service) => {
  return new Promise((resolve, reject) => {
    try {
      const queryTask = new esriJS.QueryTask(service.url);
      const query = new esriJS.Query();

      query.where = 'FID > 0';
      query.outFields = ['*'];
      query.returnGeometry = true;

      const cb = resp => {
        resolve(resp.features);
      };

      const err = error => {
        reject(error);
      };

      queryTask.execute(query, cb, err);
    } catch (error) {
      reject(error);
    }
  });
};

export default queryFS;
