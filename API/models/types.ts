import type { Model, ModelStatic } from 'sequelize';

export type Models = Record<string, ModelWithAssociate>;

export type ModelWithAssociate = ModelStatic<Model<any, any> & Record<string, any>> & {
  associate?: (models: Models) => void;
  [association: string]: unknown;
};
