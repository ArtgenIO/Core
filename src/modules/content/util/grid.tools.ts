import { IField } from '../../schema';

const sortFields = (a: IField, b: IField) =>
  a?.meta?.grid.order > b?.meta?.grid.order ? 1 : -1;

export const GridTools = { sortFields };
