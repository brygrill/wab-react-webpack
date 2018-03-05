import _ from 'lodash';

const queryFS = (esriJS, service, searchVal) => {
  return new Promise((resolve, reject) => {
    try {
      const queryTask = new esriJS.QueryTask(service.url);
      const query = new esriJS.Query();

      query.where = `ServiceNo like '${searchVal}%'`;
      query.outFields = ['*'];
      query.returnGeometry = false;

      const cb = resp => {
        const attrs = resp.features.map(item => ({ ServiceNo: item.attributes.ServiceNo }));
        const unique = _.uniqBy(attrs, _.property('ServiceNo'));
        const filtered = unique.slice(0, 15);
        resolve(filtered);
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
