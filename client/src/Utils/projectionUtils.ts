export const generateQuarterLabels = (
  year: number,
  start: number,
  end: number
) => {
  const quarters = ["Jan-Mar", "Apr-Jun", "Jul-Sep", "Oct-Dec"];
  const labels = [];
  for (let i = 2024; i <= year + end; i++) {
    for (const q of quarters) {
      labels.push(`${q}/${i}`);
    }
  }
  return labels;
};

export const getPayloadWithQuarters = (
  year: number,
  quarter: string,
  locations: string[]
) => {
  return locations.map((loc) => ({
    location: loc,
    quarter: quarter,
    year: year,
  }));
};
