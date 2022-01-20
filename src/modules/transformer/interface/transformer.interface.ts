export interface ITransformer {
  readonly reference: string;

  /**
   * Encoder
   */
  to(subject: string): string;

  /**
   * Decoder
   */
  from(subject: string): string;
}
