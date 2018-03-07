const queryFS = (esriJS, service) => {
  return new Promise((resolve, reject) => {
    try {
      const queryTask = new esriJS.QueryTask(service.url);
      const query = new esriJS.Query();

      query.where = 'FID > 0';
      query.outFields = ['*'];
      query.returnGeometry = false;

      const cb = resp => {
        // just return feature attributes
        const attrs = resp.features.map(item => item.attributes);
        resolve(attrs);
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
