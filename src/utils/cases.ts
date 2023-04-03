export const kebabCase = (str: string): string =>
  str
    .replace(/([a-z])([A-Z])/g, "$1-$2")
    .replace(/[\s_]+/g, "-")
    .toLowerCase();

const capitalize = (str: string) =>
  `${str.charAt(0).toUpperCase()}${str.slice(1).toLowerCase()}`;

export const pascalCase = (str: string): string =>
  str.split(/[_-]+/).map(capitalize).join(``);
