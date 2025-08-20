const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();

  if (!validateForm()) return;

  setIsSubmitting(true);
  setErrors({});

  try {
    const { data, error } = await signUp(
      formData.email,
      formData.password
    );

    if (error) {
      setErrors({ general: error });
    } else {
      setShowSuccess(true);
      // Will redirect to email verification page or onboarding
    }
  } catch (error: any) {
    setErrors({ general: error || 'An unexpected error occurred' });
  } finally {
    setIsSubmitting(false);
  }
};
