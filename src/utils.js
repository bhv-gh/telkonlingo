const parseCSV = (csvData) => {
  const lines = csvData.split('\n').filter(line => line.trim() !== '');
  if (lines.length < 2) return [];

  const result = [];
  const headers = lines[0].split(',').map(header => header.trim());
  
  for (let i = 1; i < lines.length; i++) {
    const obj = {};
    const currentline = lines[i].split(',');
    // Skip empty lines
    if (currentline.length < headers.length || currentline.every(field => field.trim() === '')) {
      continue;
    }
    for (let j = 0; j < headers.length; j++) {
      obj[headers[j]] = currentline[j] ? currentline[j].trim() : '';
    }
    result.push(obj);
  }
  return result;
};

export { parseCSV };
