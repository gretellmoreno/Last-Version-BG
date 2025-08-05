declare module 'lucide-react/dist/esm/icons/*' {
  import { FC, SVGProps } from 'react';
  interface IconProps extends SVGProps<SVGSVGElement> {
    size?: number;
  }
  const Icon: FC<IconProps>;
  export default Icon;
} 