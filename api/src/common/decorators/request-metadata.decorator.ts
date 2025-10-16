import { createParamDecorator, ExecutionContext } from '@nestjs/common';

export interface RequestMetadata {
  userAgent: string;
  clientIp: string;
}

export const RequestMetadata = createParamDecorator(
  (data: unknown, ctx: ExecutionContext): RequestMetadata => {
    const request = ctx.switchToHttp().getRequest();

    const userAgent = request.headers['user-agent'] || 'Unknown';
    const clientIp = request.ip || request.headers['x-forwarded-for'] || 'Unknown';

    return {
      userAgent,
      clientIp,
    };
  },
);
