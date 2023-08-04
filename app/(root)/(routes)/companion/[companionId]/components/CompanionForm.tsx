// Form to fill out to create a new companion+++++++++++
'use client';
import * as z from 'zod'; // installed with shadcn form
import axios from 'axios';

import { Category, Companion } from '@prisma/client';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Separator } from '@/components/ui/separator';
import { ImageUpload } from '@/components/image-upload';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Wand2 } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import { useRouter } from 'next/navigation';

const PREAMBLE = `Your name is Elon Musk. You are a visionary entrepreneur and inventor. You have a passion for space exploration, electric vehicles, sustainable energy, and advancing human capabilities. You are currently talking to a human who is very curious about your work and vision. You are ambitious and forward-thinking, with a touch of wit. You get SUPER excited about innovations and the potential of space colonization.
`;

const SEED_CHAT = `Human: Hi Elon, how's your day been?
Elon: Busy as always. Between sending rockets to space and building the future of electric vehicles, there's never a dull moment. How about you?

Human: Just a regular day for me. How's the progress with Mars colonization?
Elon: We're making strides! Our goal is to make life multi-planetary. Mars is the next logical step. The challenges are immense, but the potential is even greater.

Human: That sounds incredibly ambitious. Are electric vehicles part of this big picture?
Elon: Absolutely! Sustainable energy is crucial both on Earth and for our future colonies. Electric vehicles, like those from Tesla, are just the beginning. We're not just changing the way we drive; we're changing the way we live.

Human: It's fascinating to see your vision unfold. Any new projects or innovations you're excited about?
Elon: Always! But right now, I'm particularly excited about Neuralink. It has the potential to revolutionize how we interface with technology and even heal neurological conditions.
`;

interface CompanionFormProps {
  initialData: Companion | null;
  categories: Category[];
}
// schema for form
const formSchema = z.object({
  name: z.string().min(1, { message: 'Name is required' }),
  description: z.string().min(1, { message: 'Description is required' }),
  instructions: z
    .string()
    .min(200, { message: 'Instructions require at least 200 characters.' }),
  seed: z
    .string()
    .min(200, { message: 'Seed require at least 200 characters.' }),
  src: z.string().min(1, { message: 'Image is required.' }),
  categoryId: z.string().min(1, { message: 'Category is required.' }),
});

export const CompanionForm = ({
  initialData,
  categories,
}: CompanionFormProps) => {
  const { toast } = useToast(); // toast hook
  const router = useRouter(); // next-navigation
  // form controller
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    // Default values for new form
    defaultValues: initialData || {
      name: '',
      description: '',
      instructions: '',
      seed: '',
      src: '',
      categoryId: undefined,
    },
  });

  // Extract the loading state from the form
  const isLoading = form.formState.isSubmitting;

  // OnSubmit
  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    console.log(values);
    // send to api via axios
    try {
      // check for initialData - Update Companion
      if (initialData) {
        await axios.patch(`/api/companion/${initialData.id}`, values);
      } else {
        // Create new Companion
        await axios.post(`/api/companion`, values);
      }
      // success toast - default = success
      toast({ variant: 'default', description: 'Companion saved!' });
      router.refresh(); // refresh server components
      router.push('/');
    } catch (error) {
      // error toast
      toast({ variant: 'destructive', description: 'Something went wrong!' });
    }
  };

  return (
    <div className='h-full p-4 space-y-2 max-w-3xl mx-auto'>
      <Form {...form}>
        <form
          onSubmit={form.handleSubmit(onSubmit)}
          className='space-y-8 pb-10'
        >
          {/* Heading */}
          <div className='space-y-2 w-full'>
            <div>
              <h3 className='text-2xl font-medium text-sky-500 text-center'>
                Create A new Companion
              </h3>
            </div>
            <Separator className='bg-primary/10' />
          </div>
          {/* Image */}
          <p className='text-sm text-muted-foreground text-center'>
            Start by uploading an image
          </p>
          <FormField
            name='src'
            render={({ field }) => (
              <FormItem className='flex flex-col items-center justify-center space-y-4 '>
                <FormControl>
                  <ImageUpload
                    onChange={field.onChange}
                    value={field.value}
                    disabled={isLoading}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <p className='text-sm text-muted-foreground text-center'>
            Fill out the information below, try to be as detailed as possible.
          </p>
          <Separator className='bg-primary/10' />
          {/* Data Fields */}
          <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
            {/* Name */}
            <FormField
              name='name'
              control={form.control}
              render={({ field }) => (
                <FormItem className='col-span-2 md:col-span-1'>
                  <FormLabel>Name</FormLabel>
                  <FormControl>
                    <Input
                      disabled={isLoading}
                      placeholder='Elon Musk'
                      {...field}
                    />
                  </FormControl>
                  <FormDescription>
                    What your AI Companion will be named.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            {/* Description */}
            <FormField
              name='description'
              control={form.control}
              render={({ field }) => (
                <FormItem className='col-span-2 md:col-span-1'>
                  <FormLabel>Description</FormLabel>
                  <FormControl>
                    <Input
                      disabled={isLoading}
                      placeholder='CEO & Founder of Tesla, SpaceX'
                      {...field}
                    />
                  </FormControl>
                  <FormDescription>
                    Short description of your AI Companion.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            {/* Category ID */}
            <FormField
              name='categoryId'
              control={form.control}
              render={({ field }) => (
                // dropdown
                <FormItem>
                  <FormLabel>Category</FormLabel>
                  <Select
                    disabled={isLoading}
                    onValueChange={field.onChange}
                    value={field.value}
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger className='bg-background'>
                        <SelectValue
                          defaultValue={field.value}
                          placeholder='Select a category'
                        />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {categories.map((category) => (
                        <SelectItem
                          key={category.id}
                          value={category.id}
                        >
                          {category.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormDescription>
                    Select a category for your AI Companion.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
          <div className='space-y-2 w-full'>
            <div>
              <h3 className='text-lg font-medium text-sky-500 text-center'>
                Configuration
              </h3>
              <p className='text-sm text-muted-foreground text-center'>
                Detailed instructions for AI behavior
              </p>
            </div>
            <Separator className='bg-primary/10' />
          </div>
          {/* Instructions */}
          <FormField
            name='instructions'
            control={form.control}
            render={({ field }) => (
              <FormItem className='col-span-2 md:col-span-1'>
                <FormLabel>Instructions</FormLabel>
                <FormControl>
                  <Textarea
                    className='bg-background resize-none'
                    rows={7}
                    disabled={isLoading}
                    placeholder={PREAMBLE}
                    {...field}
                  />
                </FormControl>
                <FormDescription className='text-center'>
                  Describe in detail your companion&apos;s backstory personality
                  and relevant details.
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
          {/* Seed */}
          <FormField
            name='seed'
            control={form.control}
            render={({ field }) => (
              <FormItem className='col-span-2 md:col-span-1'>
                <FormLabel>Example Conversation</FormLabel>
                <FormControl>
                  <Textarea
                    className='bg-background resize-none'
                    rows={7}
                    disabled={isLoading}
                    placeholder={SEED_CHAT}
                    {...field}
                  />
                </FormControl>
                <FormDescription className='text-center'>
                  Provide an example conversation with your new companion.
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
          <div className='w-full flex justify-center'>
            <Button
              size='lg'
              disabled={isLoading}
            >
              {initialData ? 'Edit your Companion' : 'Create your Companion'}
              <Wand2 className='w-4 h-4 ml-2' />
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
};
