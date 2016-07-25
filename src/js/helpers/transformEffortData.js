const categoryExists = require('./categoryExists');
const findIndexOfCategory = require('./findIndexOfCategory');
const getDate = require('./getDate');

const normalizeEffortData = data => (
  data.reduce((result, datapoint) => {
    const categories = Object.keys(datapoint.activity);
    categories.forEach(category => {
      if (!categoryExists(result, category)) {
        result.push({
          name: category,
          data: [],
        });
      }
      const count = datapoint.activity[category];
      const date = getDate.utc(datapoint.projectDate);
      const index = findIndexOfCategory(result, category);
      if (count) {
        result[index].data.push([date, count]);
      }
    });
    return result;
  }, [])
);

module.exports = normalizeEffortData;