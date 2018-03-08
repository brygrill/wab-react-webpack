import _ from 'lodash';

const queryOfficeExtent = (offices, fid) => {
  const office = _.find(offices, o => { return o.attributes.FID === fid; });
  return office.geometry;
};

export default queryOfficeExtent;

