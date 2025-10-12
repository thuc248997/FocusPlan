import { NextRequest, NextResponse } from 'next/server'
import OpenAI from 'openai'

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
})

export async function POST(req: NextRequest) {
  try {
    const { messages } = await req.json()

    if (!messages || !Array.isArray(messages)) {
      return NextResponse.json(
        { error: 'Invalid messages format' },
        { status: 400 }
      )
    }

    // Call OpenAI API with GPT-4 mini
    const completion = await openai.chat.completions.create({
      model: 'gpt-4o-mini', // GPT-4 mini model
      messages: messages.map((msg: any) => ({
        role: msg.role,
        content: msg.content,
      })),
      temperature: 0.7,
      max_tokens: 1000,
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
