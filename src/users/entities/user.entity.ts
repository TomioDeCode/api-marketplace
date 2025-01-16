export class User {
  id: number;
  username: string;
  email: string;
  password: string;
  role: 'buyer' | 'seller' | 'admin';
  emailVerified: boolean;
  verificationCode?: string;
  createdAt: Date;
  updatedAt: Date;

  //   products?: Product[];
  //   orders?: Order[];
  //   reviews?: Review[];
}
