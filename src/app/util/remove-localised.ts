function removeLocalised(
  input: { [index: string]: any } | any[]
): { [index: string]: any } | any[] {
  if (!(input instanceof Object)) {
    return input;
  }

  if (input instanceof Array) {
    return input.map(value => removeLocalised(value));
  }

  const output = {};

  for (let [prop, value] of Object.entries(input)) {
    if (prop.endsWith("_Localised")) {
      continue;
    } else {
      output[prop] = value instanceof Object ? removeLocalised(value) : value;
    }
  }

  return output;
}

export default removeLocalised;
