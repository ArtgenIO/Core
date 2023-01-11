import { IField } from '../../../api/types/field.interface';

const sortFields = (a: IField, b: IField) =>
  a?.meta?.grid.order > b?.meta?.grid.order ? 1 : -1;

export const GridTools = { sortFields };
