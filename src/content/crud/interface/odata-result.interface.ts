export interface IODataResult {
  meta: {
    action: 'create' | 'read' | 'update' | 'delete';
    status: 'success' | 'error';
    executionTime: number;
  };
  data:
    | unknown
    | {
        message: string;
      };
}
