import fs from "fs";

function readJSONFile<T>(filename: string) {
  return new Promise<T>((resolve, reject) => {
    fs.readFile(filename, "utf-8", (err, data) => {
      if (err) {
        reject(err);
      } else {
        try {
          if (!data) { throw new Error(`No data to parse from ${filename}`) }
          resolve(JSON.parse(data));
        } catch (e) {
          reject(e);
        }
      }
    });
  });
}

export default readJSONFile;
