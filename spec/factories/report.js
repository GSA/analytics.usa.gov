import { Factory } from "fishery";
import { faker } from "@faker-js/faker";

// Basic report just has empty objects for data.  Specific reports should give
// a data item factory as a transient param to the report factory to provide
// data items.
const ReportDataItemFactory = Factory.define(() => {
  return {};
});

const ReportFactory = Factory.define(({ sequence, transientParams }) => {
  // ensure we get a new value for faker calls on each build of the factory.
  faker.seed(global.faker_seed + sequence);
  const reportDataItemFactory =
    transientParams.reportDataItemFactory || ReportDataItemFactory;
  const data = reportDataItemFactory.buildList(
    transientParams.dataItemCount || 0,
  );
  const item = {
    name: faker.company.buzzNoun(),
    sampling: [],
    query: {
      dimensions: [],
      metrics: [],
      dateRanges: [],
      orderBys: [],
      limit: faker.number.int({ max: 10000 }),
      property: `properties/${faker.number.int({ max: 1000000 })}`,
    },
    meta: {},
    data,
    totals: {
      visits: faker.number.int({ max: 10000 }),
    },
    taken_at: new Date().toISOString(),
  };
  faker.seed(global.faker_seed);
  return item;
});

export default ReportFactory;
