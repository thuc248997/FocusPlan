import { NextRequest, NextResponse } from 'next/server'
import OpenAI from 'openai'

// Force dynamic rendering for this route
export const dynamic = 'force-dynamic'

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

**QUẢN LÝ TASKS:**
- Khi người dùng yêu cầu TẠO lịch/task/sự kiện, hãy sử dụng function create_task
- Khi người dùng yêu cầu XÓA/HỦY/BỎ task, hãy sử dụng function delete_task
- Khi người dùng yêu cầu ĐỒNG BỘ/SYNC task lên Google Calendar, hãy sử dụng function sync_task

**TRUY VẤN LỊCH:**
Khi người dùng hỏi về lịch trình của họ, hãy sử dụng thông tin lịch được cung cấp để trả lời chính xác và chi tiết.

**VÍ DỤ CÂU LỆNH:**

Tạo task:
- "Tạo lịch họp với khách hàng ngày mai lúc 10h"
- "Đặt lịch hẹn bác sĩ vào thứ 5 tuần sau 14h-15h"
- "Nhắc tôi học tiếng Anh vào 20h hôm nay"

Xóa task:
- "Xóa lịch họp ngày mai"
- "Hủy task gym"
- "Bỏ cuộc hẹn với bác sĩ"

Đồng bộ task:
- "Đồng bộ task họp lên Google Calendar"
- "Sync lịch gym lên calendar"
- "Đồng bộ tất cả tasks"
- "Upload tất cả lịch chưa sync lên Google Calendar"

Xem lịch:
- "Hôm nay tôi có lịch gì không?"
- "Tuần sau tôi bận vào ngày nào?"
- "Tôi có cuộc họp nào trong tháng này?"
- "Khi nào tôi rảnh để họp?"

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

    // Define functions for task management
    const tools = [
      {
        type: 'function',
        function: {
          name: 'create_task',
          description: 'Tạo một task/lịch/sự kiện mới cho người dùng khi họ yêu cầu tạo, đặt lịch, nhắc nhở, hoặc schedule một hoạt động',
          parameters: {
            type: 'object',
            properties: {
              title: {
                type: 'string',
                description: 'Tiêu đề của task/sự kiện, ngắn gọn và rõ ràng',
              },
              description: {
                type: 'string',
                description: 'Mô tả chi tiết về task/sự kiện (nếu có)',
              },
              date: {
                type: 'string',
                description: 'Ngày của sự kiện theo định dạng YYYY-MM-DD',
              },
              startTime: {
                type: 'string',
                description: 'Thời gian bắt đầu theo định dạng HH:MM (24h format)',
              },
              endTime: {
                type: 'string',
                description: 'Thời gian kết thúc theo định dạng HH:MM (24h format)',
              },
            },
            required: ['title', 'date', 'startTime', 'endTime'],
          },
        },
      },
      {
        type: 'function',
        function: {
          name: 'delete_task',
          description: 'Xóa một task/lịch/sự kiện khi người dùng yêu cầu xóa, hủy, hoặc bỏ một task. Tìm task dựa trên tiêu đề hoặc mô tả từ người dùng.',
          parameters: {
            type: 'object',
            properties: {
              taskIdentifier: {
                type: 'string',
                description: 'Từ khóa hoặc tiêu đề để tìm task cần xóa (ví dụ: "họp", "khách hàng", "gym")',
              },
            },
            required: ['taskIdentifier'],
          },
        },
      },
      {
        type: 'function',
        function: {
          name: 'sync_task',
          description: 'Đồng bộ một hoặc nhiều task lên Google Calendar khi người dùng yêu cầu sync, đồng bộ, hoặc upload task lên calendar',
          parameters: {
            type: 'object',
            properties: {
              taskIdentifier: {
                type: 'string',
                description: 'Từ khóa hoặc tiêu đề để tìm task cần đồng bộ. Để trống nếu muốn đồng bộ tất cả tasks chưa sync.',
              },
              syncAll: {
                type: 'boolean',
                description: 'True nếu muốn đồng bộ tất cả tasks chưa sync, false nếu chỉ sync một task cụ thể',
              },
            },
            required: ['syncAll'],
          },
        },
      },
    ]

    // Call OpenAI API with GPT-4 mini and function calling
    const completion = await openai.chat.completions.create({
      model: 'gpt-4o-mini', // GPT-4 mini model
      messages: allMessages,
      tools: tools as any,
      tool_choice: 'auto',
      temperature: 0.7,
      max_tokens: 1500,
    })

    const responseMessage = completion.choices[0]?.message

    // Check if AI wants to call a function
    if (responseMessage?.tool_calls && responseMessage.tool_calls.length > 0) {
      const toolCall = responseMessage.tool_calls[0]
      
      if (toolCall.type === 'function') {
        const functionName = toolCall.function.name
        const functionArgs = JSON.parse(toolCall.function.arguments)
        
        // Handle different function calls
        if (functionName === 'create_task') {
          return NextResponse.json({
            message: `Đã tạo task: ${functionArgs.title}`,
            action: 'create_task',
            task: functionArgs,
            usage: completion.usage,
          })
        } else if (functionName === 'delete_task') {
          return NextResponse.json({
            message: `Đang tìm và xóa task: ${functionArgs.taskIdentifier}`,
            action: 'delete_task',
            taskIdentifier: functionArgs.taskIdentifier,
            usage: completion.usage,
          })
        } else if (functionName === 'sync_task') {
          return NextResponse.json({
            message: functionArgs.syncAll 
              ? 'Đang đồng bộ tất cả tasks chưa sync lên Google Calendar'
              : `Đang đồng bộ task: ${functionArgs.taskIdentifier}`,
            action: 'sync_task',
            taskIdentifier: functionArgs.taskIdentifier,
            syncAll: functionArgs.syncAll,
            usage: completion.usage,
          })
        }
      }
    }

    const aiResponse = responseMessage?.content || 'Xin lỗi, tôi không thể tạo phản hồi.'

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

