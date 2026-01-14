import z from 'zod';

export const signUpSchema = z.object({
  name:z.string().min(3,'Name must be 3 character long'),
  email:z.string().email('Enter a valid email'),
  password:z.string().min(6,'Password must be 6 cacheter long'),

})