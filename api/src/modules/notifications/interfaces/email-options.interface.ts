export interface EmailOptions {
  to: string;
  subject: string;
  template: string;
  context: Record<string, any>;
}
