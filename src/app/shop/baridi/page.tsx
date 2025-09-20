"use client"

import { useState, useEffect } from "react"
import { useCurrency } from "@/hooks/useCurrency";
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import {
    Send,
    Check,
    Calendar,
    Users,
    Clock,
    Wine,
    PartyPopper,
    ThumbsUp,
    ThumbsDown,
    ShoppingCart,
} from "lucide-react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { ScrollArea } from "@/components/ui/scroll-area"
import { useBaridiAIStore } from "@/stores/use-baridi-ai"
import {
    getRandomResponse,
    getEventResponse,
    getRecommendationResponse,
    getSportsUpdate,
    handleMusicRequest,
} from "@/data/responses"

export default function ChatPage() {
    const [customerMessage, setCustomerMessage] = useState("")
    const { conversation, addMessage, addSportsUpdate } = useBaridiAIStore()

    // Sim sports updates
    useEffect(() => {
        const interval = setInterval(() => {
            // 10% chance of sports update every 30 seconds
            if (Math.random() < 0.1) {
                const update = getSportsUpdate()
                addSportsUpdate(update)
            }
        }, 30000)

        return () => clearInterval(interval)
    }, [addSportsUpdate])

    const handleSendMessage = () => {
        if (!customerMessage.trim()) return

        // Add customer message to conversation
        addMessage({ role: "user", content: customerMessage })

        // Process the message and generate a response
        setTimeout(() => {
            if (
                customerMessage.toLowerCase().includes("event") ||
                customerMessage.toLowerCase().includes("party") ||
                customerMessage.toLowerCase().includes("planning")
            ) {
                // Event planning response
                const eventResponse = getEventResponse(customerMessage)
                addMessage({ role: "assistant", content: eventResponse.intro })
                if (eventResponse.plan) {
                    addMessage({ role: "assistant", type: "event-plan", ...eventResponse.plan })
                }
            } else if (
                customerMessage.toLowerCase().includes("recommend") ||
                customerMessage.toLowerCase().includes("suggestion") ||
                customerMessage.toLowerCase().includes("drink")
            ) {
                // Recommendation response
                const recResponse = getRecommendationResponse(customerMessage)
                addMessage({ role: "assistant", content: recResponse.intro })
                if (recResponse.items) {
                    addMessage({ role: "assistant", type: "recommendations", items: recResponse.items })
                }
            } else if (
                customerMessage.toLowerCase().includes("music") ||
                customerMessage.toLowerCase().includes("song") ||
                customerMessage.toLowerCase().includes("ngoma") ||
                customerMessage.toLowerCase().includes("dj") ||
                customerMessage.toLowerCase().includes("request")
            ) {
                // Music request
                const musicResponse = handleMusicRequest(customerMessage)
                addMessage({ role: "assistant", content: musicResponse.intro })
            } else {
                // General conversation
                const response = getRandomResponse(customerMessage)
                addMessage({ role: "assistant", content: response })
            }
        }, 600)

        setCustomerMessage("")
    }

    return (
        <div className="max-w-4xl mx-auto py-2">
            <div className="max-w-md mx-auto mb-2">
                <h1 className="text-xl font-light">Baridi AI Assistant</h1>
                <p className="text-sm text-muted-foreground">
                    Your intelligent bartender and event planning assistant with a Kenyan touch
                </p>
            </div>

            <div className="mx-auto max-w-md">
                <div className="rounded-lg border bg-background shadow-lg overflow-hidden">
                    {/* Phone header */}
                    <div className="bg-emerald-600 p-2 text-white">
                        <div className="flex items-center gap-3">
                            <Avatar className="h-10 w-10 border-2 border-white">
                                <AvatarImage src="/placeholder.svg?height=40&width=40" alt="Baridi" />
                                <AvatarFallback className="bg-white text-emerald-600">B</AvatarFallback>
                            </Avatar>
                            <div>
                                <div className="font-semibold">Baridi AI</div>
                                <div className="text-xs opacity-90">Online</div>
                            </div>
                        </div>
                    </div>

                    {/* Chat area */}
                    <ScrollArea className="h-[500px] bg-[#e5ded8] dark:bg-[#363535] p-2">
                        <div className="space-y-3">
                            {conversation.map((message, index) => (
                                <div key={index} className={`flex ${message.role === "user" ? "justify-end" : "justify-start"}`}>
                                    {message.type === "event-plan" ? (
                                        <div className="w-[90%] overflow-hidden rounded-lg bg-white dark:bg-background p-3 shadow-sm">
                                            <div className="mb-3 border-b pb-2">
                                                <div className="flex items-center gap-2">
                                                    <PartyPopper className="h-5 w-5 text-emerald-500" />
                                                    <span className="font-medium">Event Drink Package</span>
                                                </div>
                                                <div className="mt-1 grid grid-cols-2 gap-2 text-xs text-gray-500">
                                                    <div className="flex items-center gap-1">
                                                        <Calendar className="h-3 w-3" />
                                                        <span>{message.eventDetails.date}</span>
                                                    </div>
                                                    <div className="flex items-center gap-1">
                                                        <Users className="h-3 w-3" />
                                                        <span>{message.eventDetails.guestCount} guests</span>
                                                    </div>
                                                    <div className="flex items-center gap-1">
                                                        <Clock className="h-3 w-3" />
                                                        <span>{message.eventDetails.duration} hours</span>
                                                    </div>
                                                    <div className="flex items-center gap-1">
                                                        <Wine className="h-3 w-3" />
                                                        <span>{message.eventDetails.eventType}</span>
                                                    </div>
                                                </div>
                                                {message.eventDetails.discount && (
                                                    <Badge variant="outline" className="mt-1 bg-emerald-50 text-emerald-600">
                                                        {message.eventDetails.discount} Discount Applied
                                                    </Badge>
                                                )}
                                            </div>

                                            <div className="space-y-3 text-xs">
                                                {message.recommendations.map((category, catIdx) => (
                                                    <div key={catIdx}>
                                                        <div className="font-medium">{category.category}</div>
                                                        <div className="mt-1 space-y-1">
                                                            {category.items.map((item, itemIdx) => (
                                                                <div key={itemIdx} className="flex items-center justify-between">
                                                                    <div className="flex items-center gap-2">
                                                                        <div className="flex h-5 w-5 items-center justify-center rounded-full bg-emerald-100 text-emerald-600">
                                                                            <span className="text-xs">{item.quantity}</span>
                                                                        </div>
                                                                        <span>{item.name}</span>
                                                                    </div>
                                                                    <div className="text-right">
                                                                        <span>
                                                                            KSh {(item.price / item.quantity).toLocaleString()} × {item.quantity}
                                                                        </span>
                                                                        <div className="text-xs text-muted-foreground">
                                                                            KSh {item.price.toLocaleString()} total
                                                                        </div>
                                                                    </div>
                                                                </div>
                                                            ))}
                                                        </div>
                                                    </div>
                                                ))}

                                                <div className="mt-2 flex items-center justify-between border-t pt-2 text-base font-semibold">
                                                    <span className="text-sm">Total</span>
                                                    <span className="text-sm font-light">KSh {message.totalPrice.toLocaleString()}</span>
                                                </div>

                                                <div className="mt-2 flex justify-between gap-2">
                                                    <Button variant="outline" size="sm" className="h-7 text-xs flex-1">
                                                        Adjust
                                                    </Button>
                                                    <Button size="sm" className="h-7 text-xs flex-1 bg-emerald-600 hover:bg-emerald-700">
                                                        <ShoppingCart className="mr-1 h-3 w-3" /> Confirm
                                                    </Button>
                                                </div>
                                            </div>

                                            <div className="mt-1 flex items-center justify-end gap-1 text-[10px] text-gray-500">
                                                <span>{new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}</span>
                                            </div>
                                        </div>
                                    ) : message.type === "recommendations" ? (
                                        <div className="w-[85%] space-y-2">
                                            {message.items.map((item, idx) => (
                                                <div key={idx} className="flex rounded-lg bg-white dark:bg-background p-2 shadow-sm">
                                                    <div className="h-12 w-12 flex-shrink-0 overflow-hidden rounded-md bg-gray-100">
                                                        <img
                                                            src={item.image ?? ""}
                                                            alt={item.name}
                                                            className="h-full w-full object-cover"
                                                        />
                                                    </div>
                                                    <div className="ml-2 flex-1">
                                                        <div className="font-normal">{item.name}</div>
                                                        <div className="text-xs text-gray-500">{item.description}</div>
                                                        <div className="mt-1 flex items-center justify-between">
                                                            <span className="text-xs font-semibold">{item.price}</span>
                                                            <div className="flex gap-1">
                                                                <button className="rounded-full bg-emerald-100 p-1 text-emerald-600">
                                                                    <ThumbsUp className="h-3 w-3" />
                                                                </button>
                                                                <button className="rounded-full bg-gray-100 p-1 text-gray-600">
                                                                    <ThumbsDown className="h-3 w-3" />
                                                                </button>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            ))}
                                            <div className="flex justify-end">
                                                <div className="mt-1 flex items-center justify-end gap-1 text-[10px] text-gray-500">
                                                    <span>{new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}</span>
                                                </div>
                                            </div>
                                        </div>
                                    ) : message.type === "sports-update" ? (
                                        <div className="w-[90%] overflow-hidden rounded-lg bg-amber-50 p-3 shadow-sm">
                                            <div className="flex items-center gap-2">
                                                <Badge variant="outline" className="bg-amber-100 text-amber-800">
                                                    Sports Update
                                                </Badge>
                                                <span className="text-xs font-medium text-amber-800">{message.match}</span>
                                            </div>
                                            <div className="mt-2 text-xs text-amber-800">{message.content}</div>
                                            <div className="mt-1 flex items-center justify-end gap-1 text-[10px] text-amber-700">
                                                <span>{new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}</span>
                                            </div>
                                        </div>
                                    ) : (
                                        <div
                                            className={`max-w-[80%] text-xs rounded-lg p-3 ${message.role === "user" ? "bg-[#dcf8c6] text-gray-800" : "bg-white text-gray-800"
                                                }`}
                                        >
                                            {message.content}
                                            <div className="mt-1 flex items-center justify-end gap-1 text-[10px] text-gray-500">
                                                <span>{new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}</span>
                                                {message.role === "user" && <Check className="h-3 w-3" />}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    </ScrollArea>

                    {/* Input area with quick actions */}
                    <div className="border-t">
                        <div className="p-2">
                            <div className="mb-2 flex flex-wrap gap-2">
                                <Button
                                    variant="outline"
                                    size="sm"
                                    className="h-7 text-xs bg-emerald-50 text-emerald-700 hover:bg-emerald-100 hover:text-emerald-800"
                                    onClick={() => {
                                        setCustomerMessage("I need help planning an event")
                                        handleSendMessage()
                                    }}
                                >
                                    Plan Event
                                </Button>
                                <Button
                                    variant="outline"
                                    size="sm"
                                    className="h-7 text-xs bg-blue-50 text-blue-700 hover:bg-blue-100 hover:text-blue-800"
                                    onClick={() => {
                                        setCustomerMessage("Recommend some drinks")
                                        handleSendMessage()
                                    }}
                                >
                                    Drink Recommendations
                                </Button>
                                <Button
                                    variant="outline"
                                    size="sm"
                                    className="h-7 text-xs bg-purple-50 text-purple-700 hover:bg-purple-100 hover:text-purple-800"
                                    onClick={() => {
                                        setCustomerMessage("Request a song")
                                        handleSendMessage()
                                    }}
                                >
                                    Request Ngoma
                                </Button>
                                <Button
                                    variant="outline"
                                    size="sm"
                                    className="h-7 text-xs bg-amber-50 text-amber-700 hover:bg-amber-100 hover:text-amber-800"
                                    onClick={() => {
                                        setCustomerMessage("What's the score?")
                                        handleSendMessage()
                                    }}
                                >
                                    Sports Update
                                </Button>
                            </div>
                            <div className="flex items-center gap-2">
                                <Input
                                    placeholder="Type a message"
                                    value={customerMessage}
                                    onChange={(e) => setCustomerMessage(e.target.value)}
                                    onKeyDown={(e) => e.key === "Enter" && handleSendMessage()}
                                    className="flex-1"
                                />
                                <Button size="icon" onClick={handleSendMessage}>
                                    <Send className="h-4 w-4" />
                                </Button>
                            </div>
                        </div>
                    </div>

                    <div className="my-3 text-center text-xs text-muted-foreground">
                        <p className="text-center">Chat with Baridi AI to plan events, get drink recommendations, or just chat</p>
                    </div>
                </div>
            </div>
        </div>
    )
}
