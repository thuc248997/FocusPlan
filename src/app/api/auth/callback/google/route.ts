import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams
  const code = searchParams.get('code')
  const error = searchParams.get('error')

  // Log for debugging
  console.log('📝 OAuth Callback:', { 
    hasCode: !!code, 
    hasError: !!error, 
    error: error 
  })

  if (error) {
    console.error('❌ OAuth error from Google:', error)
    return NextResponse.redirect(new URL('/?error=access_denied', request.url))
  }

  if (!code) {
    console.error('❌ Missing authorization code')
    return NextResponse.redirect(new URL('/?error=missing_code', request.url))
  }

  const clientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID
  const clientSecret = process.env.GOOGLE_CLIENT_SECRET
  const redirectUri = `${request.nextUrl.origin}/api/auth/callback/google`

  console.log('🔑 OAuth Config:', {
    hasClientId: !!clientId,
    hasClientSecret: !!clientSecret,
    clientSecretValue: clientSecret === 'your_google_client_secret_here' ? 'PLACEHOLDER!' : 'SET',
    redirectUri
  })

  if (!clientId || !clientSecret) {
    console.error('❌ Missing Google OAuth credentials in .env.local')
    return NextResponse.redirect(new URL('/?error=config_error', request.url))
  }

  if (clientSecret === 'your_google_client_secret_here') {
    console.error('❌ Google Client Secret is still placeholder! Please update .env.local')
    return NextResponse.redirect(new URL('/?error=config_error', request.url))
  }

  try {
    console.log('🔄 Exchanging code for tokens...')
    
    // Exchange code for tokens
    const tokenResponse = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        code,
        client_id: clientId,
        client_secret: clientSecret,
        redirect_uri: redirectUri,
        grant_type: 'authorization_code',
      }),
    })

    const tokens = await tokenResponse.json()

    if (tokens.error) {
      console.error('❌ Token exchange error:', tokens.error_description || tokens.error)
      console.error('Full error:', tokens)
      throw new Error(tokens.error_description || tokens.error)
    }

    console.log('✅ Tokens received successfully')

    // Get user info with the access token
    console.log('👤 Fetching user info...')
    const userInfoResponse = await fetch('https://www.googleapis.com/oauth2/v2/userinfo', {
      headers: {
        'Authorization': `Bearer ${tokens.access_token}`,
      },
    })

    const userInfo = await userInfoResponse.json()
    console.log('✅ User info received:', { email: userInfo.email, name: userInfo.name })

    // Redirect to home with tokens and user info (stored in URL hash for client-side access)
    const redirectUrl = new URL('/', request.url)
    const hashData = {
      access_token: tokens.access_token,
      refresh_token: tokens.refresh_token || '',
      expires_in: tokens.expires_in,
      user_email: userInfo.email || '',
      user_name: userInfo.name || '',
      user_picture: userInfo.picture || '',
    }
    
    redirectUrl.hash = new URLSearchParams(hashData).toString()
    
    console.log('✅ Redirecting to home with tokens')
    return NextResponse.redirect(redirectUrl)
  } catch (error) {
    console.error('❌ OAuth error:', error)
    return NextResponse.redirect(new URL('/?error=oauth_failed', request.url))
  }
}
