import { NextRequest, NextResponse } from 'next/server'
import OpenAI from 'openai'

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
})

export async function POST(req: NextRequest) {
  try {
    const { messages, calendarContext } = await req.json()

    if (!messages || !Array.isArray(messages)) {
      return NextResponse.json(
        { error: 'Invalid messages format' },
        { status: 400 }
      )
    }

    // Build system message with calendar context if available
    const systemMessages: any[] = [
      {
        role: 'system',
        content: `Bạn là trợ lý AI thông minh, hữu ích và thân thiện. Bạn có thể giúp người dùng quản lý lịch trình, tạo kế hoạch và trả lời các câu hỏi.
        
Khi người dùng hỏi về lịch trình của họ, hãy sử dụng thông tin lịch được cung cấp để trả lời chính xác và chi tiết.

Một số câu hỏi mà người dùng có thể hỏi:
- "Hôm nay tôi có lịch gì không?"
- "Tuần sau tôi bận vào ngày nào?"
- "Tôi có cuộc họp nào trong tháng này?"
- "Khi nào tôi rảnh để họp?"
- "Lịch của tôi vào ngày [date]?"

Hãy trả lời một cách tự nhiên, rõ ràng và hữu ích.`,
      },
    ]

    // Add calendar context if available
    if (calendarContext?.summary) {
      systemMessages.push({
        role: 'system',
        content: `THÔNG TIN LỊCH HIỆN TẠI CỦA NGƯỜI DÙNG:\n\n${calendarContext.summary}\n\nHãy sử dụng thông tin này để trả lời các câu hỏi về lịch của người dùng.`,
      })
    }

    // Combine system messages with user messages
    const allMessages = [
      ...systemMessages,
      ...messages.map((msg: any) => ({
        role: msg.role,
        content: msg.content,
      })),
    ]

    // Call OpenAI API with GPT-4 mini
    const completion = await openai.chat.completions.create({
      model: 'gpt-4o-mini', // GPT-4 mini model
      messages: allMessages,
      temperature: 0.7,
      max_tokens: 1500,
    })

    const aiResponse = completion.choices[0]?.message?.content || 'Xin lỗi, tôi không thể tạo phản hồi.'

    return NextResponse.json({
      message: aiResponse,
      usage: completion.usage,
    })
  } catch (error: any) {
    console.error('OpenAI API Error:', error)
    
    // Handle specific OpenAI errors
    if (error?.error?.type === 'invalid_request_error') {
      return NextResponse.json(
        { error: 'Yêu cầu không hợp lệ: ' + error.error.message },
        { status: 400 }
      )
    }
    
    if (error?.status === 401) {
      return NextResponse.json(
        { error: 'API key không hợp lệ' },
        { status: 401 }
      )
    }
    
    if (error?.status === 429) {
      return NextResponse.json(
        { error: 'Quá nhiều yêu cầu. Vui lòng thử lại sau.' },
        { status: 429 }
      )
    }

    return NextResponse.json(
      { error: 'Đã xảy ra lỗi khi xử lý yêu cầu: ' + (error?.message || 'Unknown error') },
      { status: 500 }
    )
  }
}

