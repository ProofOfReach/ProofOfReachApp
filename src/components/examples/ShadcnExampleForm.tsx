import React, { useState } from 'react'
import { Button } from '../ui/button'
import { Input } from '../ui/input'
import { Textarea } from '../ui/textarea'
import { Select, SelectOption } from '../ui/select'
import { Checkbox } from '../ui/checkbox'
import { 
  Form, 
  FormField, 
  FormItem, 
  FormLabel, 
  FormDescription, 
  FormMessage 
} from '../ui/form'
import { 
  Card, 
  CardHeader, 
  CardTitle, 
  CardDescription, 
  CardContent, 
  CardFooter 
} from '../ui/card'
import { Label } from '../ui/label'

/**
 * Example form using the shadcn/ui-style components
 * This demonstrates how to use the components together
 */
interface FormData {
  name: string
  email: string
  message: string
  category: string
  subscribe: boolean
}

const ShadcnExampleForm: React.FC = () => {
  const [formData, setFormData] = useState<FormData>({
    name: '',
    email: '',
    message: '',
    category: '',
    subscribe: false
  })
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [submitted, setSubmitted] = useState(false)

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value
    }))

    // Clear error when field is being edited
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }))
    }
  }

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {}
    
    if (!formData.name.trim()) {
      newErrors.name = 'Name is required'
    }
    
    if (!formData.email.trim()) {
      newErrors.email = 'Email is required'
    } else if (!/^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i.test(formData.email)) {
      newErrors.email = 'Invalid email address'
    }
    
    if (!formData.message.trim()) {
      newErrors.message = 'Message is required'
    }
    
    if (!formData.category) {
      newErrors.category = 'Please select a category'
    }
    
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    
    if (validateForm()) {
      // Form is valid, handle submission
      console.log('Form data submitted:', formData)
      setSubmitted(true)
    }
  }

  const handleReset = () => {
    setFormData({
      name: '',
      email: '',
      message: '',
      category: '',
      subscribe: false
    })
    setErrors({})
    setSubmitted(false)
  }

  if (submitted) {
    return (
      <Card className="w-full max-w-md mx-auto">
        <CardHeader>
          <CardTitle>Thank You!</CardTitle>
          <CardDescription>Your message has been submitted successfully.</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="mb-4 text-sm text-gray-600 dark:text-gray-400">
            We have received your information and will get back to you soon.
          </p>
        </CardContent>
        <CardFooter>
          <Button onClick={handleReset} variant="outline">Submit Another Message</Button>
        </CardFooter>
      </Card>
    )
  }

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle>Contact Form</CardTitle>
        <CardDescription>Send us a message using this form.</CardDescription>
      </CardHeader>
      <CardContent>
        <Form onSubmit={handleSubmit}>
          <FormField>
            <FormItem>
              <FormLabel required>Name</FormLabel>
              <Input
                name="name"
                value={formData.name}
                onChange={handleChange}
                placeholder="Enter your name"
                error={!!errors.name}
              />
              {errors.name && <FormMessage>{errors.name}</FormMessage>}
            </FormItem>
          </FormField>

          <FormField>
            <FormItem>
              <FormLabel required>Email</FormLabel>
              <Input
                name="email"
                type="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="Enter your email"
                error={!!errors.email}
              />
              {errors.email && <FormMessage>{errors.email}</FormMessage>}
            </FormItem>
          </FormField>

          <FormField>
            <FormItem>
              <FormLabel required>Category</FormLabel>
              <Select
                name="category"
                value={formData.category}
                onChange={handleChange}
                error={!!errors.category}
              >
                <SelectOption value="">Select a category</SelectOption>
                <SelectOption value="general">General Inquiry</SelectOption>
                <SelectOption value="support">Technical Support</SelectOption>
                <SelectOption value="feedback">Feedback</SelectOption>
                <SelectOption value="other">Other</SelectOption>
              </Select>
              {errors.category && <FormMessage>{errors.category}</FormMessage>}
            </FormItem>
          </FormField>

          <FormField>
            <FormItem>
              <FormLabel required>Message</FormLabel>
              <Textarea
                name="message"
                value={formData.message}
                onChange={handleChange}
                placeholder="Type your message here"
                rows={4}
                error={!!errors.message}
              />
              {errors.message && <FormMessage>{errors.message}</FormMessage>}
            </FormItem>
          </FormField>

          <FormField>
            <FormItem>
              <div className="pt-2">
                <Checkbox
                  id="subscribe"
                  name="subscribe"
                  checked={formData.subscribe}
                  onChange={handleChange}
                  label="Subscribe to newsletter"
                />
              </div>
              <FormDescription>
                We'll send occasional updates and important news.
              </FormDescription>
            </FormItem>
          </FormField>

          <div className="mt-6 flex justify-end space-x-4">
            <Button type="button" variant="outline" onClick={handleReset}>
              Reset
            </Button>
            <Button type="submit">
              Submit
            </Button>
          </div>
        </Form>
      </CardContent>
    </Card>
  )
}

export default ShadcnExampleForm