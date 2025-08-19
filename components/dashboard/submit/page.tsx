import StartupSubmissionForm from '@/components/forms/StartupSubmissionForm';

export default function SubmitStartupPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">Submit Your Startup</h1>
      <StartupSubmissionForm />
    </div>
  );
}
