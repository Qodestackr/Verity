"use client"

import { useState } from "react"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Loader2, ThumbsUp, Sparkles } from "lucide-react"
import { toast } from "sonner"

interface FeedbackSurveyProps {
    onClose: () => void
}

export function FeedbackSurvey({
    onClose }: FeedbackSurveyProps) {
    const [step, setStep] = useState(1)
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [feedback, setFeedback] = useState({
        satisfaction: "",
        featureRequest: "",
        painPoints: "",
    })

    const handleSubmit = async () => {
        setIsSubmitting(true)

        try {
            // Simulate API call
            await new Promise((resolve) => setTimeout(resolve, 1500))

            toast.success("Feedback submitted", {
                description: "Thank you for helping us improve Alcora!"
            })

            setStep(3)
        } catch (error) {
            toast.error("Error submitting feedback", {
                description: "Please try again later"
            })
        } finally {
            setIsSubmitting(false)
        }
    }

    return (
        <Dialog open={true} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-md">
                {step === 1 && (
                    <>
                        <DialogHeader>
                            <DialogTitle>Help us improve Alcora</DialogTitle>
                            <DialogDescription>
                                Your feedback helps us build better marketing tools for your business
                            </DialogDescription>
                        </DialogHeader>

                        <div className="space-y-4 py-4">
                            <div className="space-y-2">
                                <Label>How satisfied are you with our marketing tools?</Label>
                                <RadioGroup
                                    value={feedback.satisfaction}
                                    onValueChange={(value) => setFeedback({ ...feedback, satisfaction: value })}
                                >
                                    <div className="flex items-center space-x-2">
                                        <RadioGroupItem value="very_satisfied" id="very_satisfied" />
                                        <Label htmlFor="very_satisfied">Very satisfied</Label>
                                    </div>
                                    <div className="flex items-center space-x-2">
                                        <RadioGroupItem value="satisfied" id="satisfied" />
                                        <Label htmlFor="satisfied">Satisfied</Label>
                                    </div>
                                    <div className="flex items-center space-x-2">
                                        <RadioGroupItem value="neutral" id="neutral" />
                                        <Label htmlFor="neutral">Neutral</Label>
                                    </div>
                                    <div className="flex items-center space-x-2">
                                        <RadioGroupItem value="dissatisfied" id="dissatisfied" />
                                        <Label htmlFor="dissatisfied">Dissatisfied</Label>
                                    </div>
                                </RadioGroup>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="pain-points">What challenges are you facing in marketing your business?</Label>
                                <Textarea
                                    id="pain-points"
                                    placeholder="Tell us about your biggest pain points..."
                                    value={feedback.painPoints}
                                    onChange={(e) => setFeedback({ ...feedback, painPoints: e.target.value })}
                                />
                            </div>
                        </div>

                        <DialogFooter>
                            <Button variant="outline" onClick={onClose}>
                                Cancel
                            </Button>
                            <Button onClick={() => setStep(2)}>Continue</Button>
                        </DialogFooter>
                    </>
                )}

                {step === 2 && (
                    <>
                        <DialogHeader>
                            <DialogTitle>Feature Requests</DialogTitle>
                            <DialogDescription>Tell us what marketing tools would help your business grow</DialogDescription>
                        </DialogHeader>

                        <div className="space-y-4 py-4">
                            <div className="space-y-2">
                                <Label htmlFor="feature-request">What marketing features would you like to see?</Label>
                                <Textarea
                                    id="feature-request"
                                    placeholder="Describe the features that would help your business..."
                                    rows={5}
                                    value={feedback.featureRequest}
                                    onChange={(e) => setFeedback({ ...feedback, featureRequest: e.target.value })}
                                />
                            </div>
                        </div>

                        <DialogFooter>
                            <Button variant="outline" onClick={() => setStep(1)}>
                                Back
                            </Button>
                            <Button onClick={handleSubmit} disabled={isSubmitting}>
                                {isSubmitting ? (
                                    <>
                                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                        Submitting...
                                    </>
                                ) : (
                                    "Submit Feedback"
                                )}
                            </Button>
                        </DialogFooter>
                    </>
                )}

                {step === 3 && (
                    <>
                        <DialogHeader className="flex flex-col justify-center items-center">
                            <DialogTitle className="font-normal">Thank You!</DialogTitle>
                            <DialogDescription>Your feedback has been submitted successfully</DialogDescription>
                        </DialogHeader>

                        <div className="flex flex-col items-center justify-center py-2">
                            <div className="rounded-full bg-emerald-100 p-3 mb-2">
                                <ThumbsUp className="h-8 w-8 text-emerald-600" />
                            </div>
                            <p className="text-center text-sm text-muted-foreground">
                                We appreciate your input! Your feedback helps us build better tools for your business.
                            </p>
                            <div className="flex items-center gap-2 mt-4 bg-emerald-50 p-2 rounded-md">
                                <Sparkles className="h-4 w-4 text-emerald-600" />
                                <p className="text-xs text-emerald-700">
                                    Our team will review your suggestions and prioritize new features accordingly.
                                </p>
                            </div>
                        </div>

                        <DialogFooter>
                            <Button onClick={onClose}>Close</Button>
                        </DialogFooter>
                    </>
                )}
            </DialogContent>
        </Dialog>
    )
}
