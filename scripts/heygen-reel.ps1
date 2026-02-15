param(
  [string]$Text = "Три главные новости в ИИ: скорость выросла, стоимость снизилась, и ИИ теперь в масс-маркете. Второе - безопасность: больше локальных решений и контроль данных. Третье - новый рынок навыков: кто умеет правильно использовать ИИ, получает преимущество. Хочешь, сделаю обзор для твоей ниши.",
  [string]$AvatarId = "a77c71368f3346d59219fbcdb5bbaebb",
  [string]$VoiceId = "e4a7e9b889644f64af5676e5b6ac41e9"
)

$ErrorActionPreference = "Stop"

if (-not $env:HEYGEN_API_KEY) {
  Write-Error "HEYGEN_API_KEY env var is not set. Set it in Windows Environment Variables and restart PowerShell."
  exit 1
}

Write-Host "[1/3] Generating TTS audio..."
$ttsBody = @{
  text = $Text
  voice_id = $VoiceId
  speed = 1
  pitch = 0
} | ConvertTo-Json -Depth 6

$ttsResp = Invoke-RestMethod -Method Post `
  -Uri "https://api.heygen.com/v1/audio/text_to_speech" `
  -Headers @{ "X-Api-Key" = $env:HEYGEN_API_KEY } `
  -ContentType "application/json" `
  -Body $ttsBody

$audioUrl = $ttsResp.data.audio_url
if (-not $audioUrl) {
  Write-Error "TTS response did not include data.audio_url. Full response: $(ConvertTo-Json $ttsResp -Depth 6)"
  exit 1
}

Write-Host "[2/3] Creating video with audio..."
$videoBody = @{
  caption = $false
  title = "AI News Reel"
  video_inputs = @(
    @{
      character = @{
        type = "avatar"
        avatar_id = $AvatarId
        avatar_style = "normal"
        scale = 1
        offset = @{ x = 0; y = 0 }
      }
      voice = @{
        type = "audio"
        audio_url = $audioUrl
      }
      background = @{ type = "color"; value = "#FFFFFF" }
    }
  )
  dimension = @{ width = 1080; height = 1920 }
} | ConvertTo-Json -Depth 8

$videoResp = Invoke-RestMethod -Method Post `
  -Uri "https://api.heygen.com/v2/video/generate" `
  -Headers @{ "X-Api-Key" = $env:HEYGEN_API_KEY } `
  -ContentType "application/json" `
  -Body $videoBody

$videoId = $videoResp.data.video_id
if (-not $videoId) {
  Write-Error "Video generation did not return data.video_id. Full response: $(ConvertTo-Json $videoResp -Depth 6)"
  exit 1
}

Write-Host "[3/3] Waiting for completion... video_id=$videoId"
while ($true) {
  $status = Invoke-RestMethod -Method Get `
    -Uri "https://api.heygen.com/v1/video_status.get?video_id=$videoId" `
    -Headers @{ "X-Api-Key" = $env:HEYGEN_API_KEY }

  if ($status.code -eq 200) {
    $url = $status.data.video_url
    if (-not $url) { $url = $status.data.url }
    Write-Host "DONE: $url"
    break
  }
  if ($status.code -ne 100) {
    Write-Error "Failed: $(ConvertTo-Json $status -Depth 6)"
    exit 1
  }
  Start-Sleep -Seconds 15
}
