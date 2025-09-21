# Verity Draft Orders Strategy Guide

### 🎯 Vision Statement

Verity leverages Saleor's Draft Orders as the foundation for conversational commerce, enabling seamless B2B and B2C transactions in Kenya's liquor market. Our approach treats Draft Orders as "working state" - a staging ground where AI agents and human sales reps can build, modify, and perfect orders without touching inventory until commitment.

### 🧠 Core Philosophy: "Draft-First Commerce"

**The Golden Rule**: _Nothing touches inventory until it's a confirmed Order_

- **Drafts** = Planning, conversation, exploration, quotes
- **Orders** = Commitment, inventory movement, fulfillment
- **Returns/Cancellations** = Always handled on confirmed Orders, never drafts


## 🏗️ Architecture Overview

### Core Components

1. **AI Sales Agents** - WhatsApp, Web, Meta Suite(Instagram, Facebook)
2. **Draft Order Engine** - Saleor GraphQL backend
3. **Conversation State Manager** - Session persistence
4. **Inventory Guard** - Only Orders affect stock
5. **Analytics Pipeline** - Conversion tracking

### Data Flow

```
Customer Inquiry → AI Agent → Draft Order Creation →
Conversation Loop → Draft Updates → Customer Decision →
Order Confirmation → Inventory Movement → Fulfillment
```

---

## 🎪 Use Cases & Workflows

### 1. B2B Wholesale Orders

**Scenario**: Busy liquor store restocking from EABL

```
Customer: "I need to restock for World Cup weekend"
AI Agent: "Perfect! Let me help you build that order. Starting with your usual?"
→ Creates Draft Order with customer's historical preferences
→ Customer adds: 6 crates Tusker, 3 Johnnie Walker Red
→ AI suggests: "Don't forget mixers and ice for the crowds!"
→ Customer: "Add 10 cases Soda, 5 bags ice"
→ Customer: "Save this, I'll confirm after checking my storage"
→ Draft saved, customer can return anytime
→ Later: "Looks good, let's proceed"
→ Draft converted to Order, inventory deducted
```

**Benefits**:

- No pressure checkout
- Can pause/resume across sessions
- Sales rep can review before confirmation
- Credit checks can happen at conversion time

### 2. Conversational Commerce (WhatsApp/Web)

**Scenario**: Party planner ordering via WhatsApp

```
Customer: "Planning a corporate event for 50 people"
AI Agent: "Exciting! I've started your event order. What's the vibe?"
→ Creates Draft Order tagged with "corporate-event"
→ AI recommends packages based on headcount
→ Customer explores options, AI updates draft in real-time
→ Customer: "Perfect, but can you hold this? Need approval"
→ Draft persists with all conversation context
→ Customer returns next day: "Approved! Let's do it"
→ One-click conversion to confirmed Order
```

**Benefits**:

- Natural conversation flow
- No abandoned cart anxiety
- Rich context preservation
- Seamless approval workflows

### 3. Quote-to-Order B2B Flow

**Scenario**: Hotel chain procurement

```
Sales Rep: Creates draft for hotel chain's monthly order
→ Applies volume discounts, custom pricing
→ Adds special delivery instructions
→ Shares draft link with procurement manager
→ Manager reviews, requests modifications
→ Rep updates draft collaboratively
→ After approval: converts to standing Order
→ Sets up recurring order pattern
```

**Benefits**:

- Professional quote generation
- Collaborative editing
- Approval workflows
- Template creation for recurring orders

---

## 🛠️ Technical Implementation

### GraphQL Mutations for Draft Management

#### Creating a Draft Order

```graphql
mutation CreateDraftOrder($input: DraftOrderCreateInput!) {
  draftOrderCreate(input: $input) {
    order {
      id
      status
      number
      total {
        gross {
          amount
          currency
        }
      }
      lines {
        id
        quantity
        productName
        variantName
      }
      metadata {
        key
        value
      }
    }
    errors {
      field
      message
      code
    }
  }
}
```

#### Adding Lines to Draft

```graphql
mutation AddDraftOrderLine($orderId: ID!, $input: OrderLineCreateInput!) {
  draftOrderLinesAdd(id: $orderId, input: [$input]) {
    order {
      id
      lines {
        id
        quantity
        productName
        totalPrice {
          gross {
            amount
          }
        }
      }
    }
    errors {
      field
      message
    }
  }
}
```

#### Converting Draft to Order

```graphql
mutation CompleteDraftOrder($id: ID!) {
  draftOrderComplete(id: $id) {
    order {
      id
      status
      number
      created
    }
    errors {
      field
      message
    }
  }
}
```

### Metadata Schema for Verity

Every Draft Order should include rich metadata:

```json
{
  "source": "whatsapp|web|ussd|sales_rep",
  "agent_type": "ai|human",
  "agent_id": "ai-betty|rep-john",
  "customer_type": "b2b|b2c",
  "session_id": "uuid",
  "conversation_context": "event_planning|restocking|corporate",
  "priority": "urgent|normal|low",
  "approval_required": "true|false",
  "quote_valid_until": "2024-01-15T00:00:00Z"
}
```

<!--
TODO: FUTURE ENHANCEMENTS
1. Draft Versioning
Add soft versioning to Draft Orders via metadata or internal history logs.
WHY:
- Lets AI agents or reps say: “Rolling back to what we discussed yesterday.”
- Enables diffing for analytics: “What changes increased conversion?”
- Opens the door to “undo” for users, even in conversational UI.
```json
{
  "draft_version": 3,
  "version_notes": "Added mixers and ice",
  "previous_version_id": "draft_001_v2:timestamp"
}
```
2. METADATA: 🧾 Attach Payment Intents Early
Even before conversion, associate a Bank/M-Pesa payment intent (or BNPL status).
Why:
- Real-world signal of purchase readiness
- Enables "Approve + Pay" flow in one tap
- Can be abandoned/expired gracefully
```json
{
  "payment_intent_status": "pending|authorized|failed",
  "bnpl_status": "eligible|awaiting_limit_check|declined"
}
```
3. 🚦 Dynamic Draft Statuses
Add custom status flows: "in_discussion", "awaiting_approval", "ready_to_confirm" before DRAFT gets completed.
Why:
- Lets you run better analytics on friction points
- Adds nuance to dashboards ("50% stuck at awaiting_approval")

4. 🔁 Smart Follow-Up Engine
Trigger automated WhatsApp nudges after X hours if draft is idle:
- “Your quote for the hotel order is ready. Want me to schedule a reminder?”
- “Still thinking about that Tusker deal?”

Make these tied to metadata like: last_modified, customer_type, context_event_type
-->

### Python Service Layer Example

```python
class VerityDraftService:
    def __init__(self, saleor_client):
        self.client = saleor_client

    async def create_conversational_draft(
        self,
        customer_id: str,
        source: str,
        agent_id: str,
        context: dict = None
    ):
        """Create a draft order for conversational commerce"""
        metadata = [
            {"key": "source", "value": source},
            {"key": "agent_id", "value": agent_id},
            {"key": "session_id", "value": str(uuid.uuid4())},
            {"key": "created_at", "value": datetime.utcnow().isoformat()},
        ]

        if context:
            for key, value in context.items():
                metadata.append({"key": f"context_{key}", "value": str(value)})

        input_data = {
            "user": customer_id,
            "metadata": metadata
        }

        result = await self.client.execute(CREATE_DRAFT_MUTATION, input_data)
        return result['draftOrderCreate']['order']

    async def add_ai_recommendations(
        self,
        draft_id: str,
        customer_profile: dict,
        context: str
    ):
        """AI-powered product recommendations"""
        recommendations = await self.get_ai_recommendations(
            customer_profile,
            context
        )

        for product in recommendations:
            await self.add_line_to_draft(
                draft_id,
                product['variant_id'],
                product['quantity']
            )

    async def convert_to_order(self, draft_id: str):
        """Convert draft to confirmed order with inventory impact"""
        # Pre-conversion validations
        await self.validate_inventory_availability(draft_id)
        await self.validate_customer_credit(draft_id)

        # Convert
        result = await self.client.execute(
            COMPLETE_DRAFT_MUTATION,
            {"id": draft_id}
        )

        # Post-conversion actions
        order = result['draftOrderComplete']['order']
        await self.trigger_fulfillment_workflow(order['id'])
        await self.send_confirmation_message(order)

        return order
```

---

## 📊 Analytics & Insights

### Funnel Metrics to Track

1. **Draft Creation Rate**: Conversations → Drafts
2. **Draft Engagement**: Lines added, modifications, time spent
3. **Conversion Rate**: Drafts → Confirmed Orders
4. **Abandonment Analysis**: Where/when drafts are dropped
5. **Agent Performance**: AI vs Human conversion rates
6. **Channel Effectiveness**: WhatsApp vs Web vs Sales Rep

### Dashboard Queries

```sql
-- Draft to Order Conversion Rates by Channel
SELECT
    metadata->>'source' as channel,
    COUNT(CASE WHEN status = 'DRAFT' THEN 1 END) as drafts_created,
    COUNT(CASE WHEN status != 'DRAFT' THEN 1 END) as orders_completed,
    (COUNT(CASE WHEN status != 'DRAFT' THEN 1 END) * 100.0 /
     COUNT(*)) as conversion_rate
FROM orders
WHERE created >= NOW() - INTERVAL '30 days'
GROUP BY metadata->>'source';

-- AI Agent Performance
SELECT
    metadata->>'agent_id' as agent,
    AVG(total_gross_amount) as avg_order_value,
    COUNT(*) as total_interactions,
    SUM(CASE WHEN status != 'DRAFT' THEN 1 ELSE 0 END) as conversions
FROM orders
WHERE metadata->>'agent_type' = 'ai'
GROUP BY metadata->>'agent_id';
```

---

## 🔒 Security & Permissions

### Access Control Matrix

| Role      | Draft Create | Draft Edit | Draft View | Draft Convert | Order Fulfill |
| --------- | ------------ | ---------- | ---------- | ------------- | ------------- |
| AI Agent  | ✅           | ✅         | ✅         | ❌            | ❌            |
| Sales Rep | ✅           | ✅         | ✅         | ✅            | ✅            |
| Customer  | ❌           | ❌         | ✅ (own)   | ✅ (own)      | ❌            |
| Manager   | ✅           | ✅         | ✅         | ✅            | ✅            |

### Implementation

```python
def check_draft_permissions(user, draft, action):
    if action == 'convert' and user.role == 'ai_agent':
        return False  # AI can't convert to orders

    if action == 'view' and user.role == 'customer':
        return draft.customer_id == user.id

    return user.role in ['sales_rep', 'manager']
```

---

## 🚀 Integration Patterns

### WhatsApp Business API Integration

```javascript
// WhatsApp webhook handler
app.post("/whatsapp/webhook", async (req, res) => {
  const { message, from } = req.body;

  // Get or create customer
  const customer = await getOrCreateCustomer(from);

  // Get active draft for this session
  let draft = await getActiveDraft(customer.id, "whatsapp");

  if (!draft) {
    draft = await createConversationalDraft({
      customerId: customer.id,
      source: "whatsapp",
      agentId: "ai-betty",
    });
  }

  // Process message with AI
  const response = await processMessageWithAI(message, draft, customer);

  // Update draft based on AI response
  if (response.draftUpdates) {
    await updateDraft(draft.id, response.draftUpdates);
  }

  // Send response
  await sendWhatsAppMessage(from, response.message);

  res.status(200).send("OK");
});
```

### Web Frontend Integration

```typescript
// React hook for draft management
function useDraftOrder(customerId: string) {
  const [draft, setDraft] = useState(null);
  const [loading, setLoading] = useState(false);

  const createDraft = async (context = {}) => {
    setLoading(true);
    const newDraft = await Verity.drafts.create({
      customerId,
      source: "web",
      context,
    });
    setDraft(newDraft);
    setLoading(false);
    return newDraft;
  };

  const addProduct = async (variantId: string, quantity: number) => {
    if (!draft) return;

    const updated = await Verity.drafts.addLine(draft.id, {
      variantId,
      quantity,
    });
    setDraft(updated);
  };

  const checkout = async () => {
    if (!draft) return;

    const order = await Verity.drafts.convert(draft.id);
    setDraft(null); // Clear draft after conversion
    return order;
  };

  return { draft, createDraft, addProduct, checkout, loading };
}
```

---

## 🎨 UI/UX Considerations

### Draft Order States & Visual Indicators

1. **Active Draft** - Green indicator, "Continue Building"
2. **Saved Draft** - Blue indicator, "Resume Order"
3. **Pending Approval** - Yellow indicator, "Awaiting Approval"
4. **Expired Quote** - Red indicator, "Request New Quote"

### Customer Communication

```
Draft Created: "I've started building your order! You can modify it anytime."
Draft Updated: "Added 3x Tusker to your order. Current total: KSh 2,400"
Draft Saved: "Your order is saved. Continue anytime at getverity.com/order-123"
Draft Converted: "Order confirmed! KSh 2,400 charged. Delivery in 2-4 hours."
```

---

## 🔧 Monitoring & Alerts

### Health Checks

- Draft creation/update latency
- AI agent response times
- Draft-to-order conversion failures
- Inventory availability checks

### Critical Alerts

- Failed order conversions
- AI agent errors
- Payment processing issues
- Inventory discrepancies

### Metrics Dashboard

```python
# Key metrics to monitor
DRAFT_METRICS = {
    'drafts_created_today': lambda: count_drafts_by_date(today()),
    'conversion_rate_7d': lambda: calculate_conversion_rate(days=7),
    'avg_draft_value': lambda: calculate_avg_draft_value(),
    'ai_agent_uptime': lambda: check_ai_agent_health(),
    'pending_approvals': lambda: count_pending_approvals()
}
```

---

## 🌟 Success Metrics

### Business KPIs

- **Conversion Rate**: Draft Orders → Confirmed Orders
- **Average Order Value**: Revenue per converted draft
- **Customer Lifetime Value**: Long-term draft engagement
- **Operational Efficiency**: Time from inquiry to fulfillment

### Technical KPIs

- **Response Time**: AI agent message processing
- **Uptime**: System availability across channels
- **Error Rate**: Failed draft operations
- **Scalability**: Concurrent draft handling capacity

---

## 🚧 Implementation Roadmap

### Phase 1: Foundation (Weeks 1-4)

- [ ] Saleor Draft Orders setup
- [ ] Basic GraphQL mutations
- [ ] Customer authentication
- [ ] Simple web interface

### Phase 2: AI Integration (Weeks 5-8)

- [ ] WhatsApp Business API integration
- [ ] AI agent conversation engine
- [ ] Product recommendation system
- [ ] Draft state management

### Phase 3: B2B Features (Weeks 9-12)

- [ ] Quote generation and sharing
- [ ] Approval workflows
- [ ] Volume pricing and discounts
- [ ] Credit limit checks

### Phase 4: Analytics & Optimization (Weeks 13-16)

- [ ] Conversion tracking
- [ ] Performance dashboards
- [ ] A/B testing framework
- [ ] Advanced AI training

---

## 🏁 Getting Started

### Prerequisites

```bash
# Install dependencies
npm install @saleor/sdk graphql
pip install saleor-sdk celery redis

# Environment variables
export SALEOR_API_URL="https://your-saleor-instance.com/graphql/"
export SALEOR_AUTH_TOKEN="your-auth-token"
export WHATSAPP_API_TOKEN="your-whatsapp-token"
export AI_SERVICE_URL="https://your-ai-service.com"
```

### Quick Start

```bash
# Clone the Verity repository
git clone https://github.com/your-org/Verity.git
cd Verity

# Install dependencies
npm install && pip install -r requirements.txt

# Setup database
python manage.py migrate

# Start services
docker-compose up -d redis postgres
python manage.py runserver &
npm run dev

# Test draft creation
curl -X POST http://localhost:8000/api/drafts \
  -H "Content-Type: application/json" \
  -d '{"customer_id": "test", "source": "web"}'
```

---

## 📚 Additional Resources

- [Saleor Draft Orders Documentation](https://docs.saleor.io/docs/3.x/api-usage/orders)
- [WhatsApp Business API Guide](https://developers.facebook.com/docs/whatsapp)
- [Kenyan E-commerce Regulations]()
- [Liquor Licensing Requirements](https://kra.go.ke)

---

**Built with ❤️ for the Kenyan market by the Verity team**

_"Revolutionizing liquor commerce, one conversation at a time."_
