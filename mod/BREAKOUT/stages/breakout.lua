local function getVisualTheme()
    local key = string.lower(tostring(songName or ''))
    if key == 'overdrive' then
        return 'overdrive-bg', 'overdrive-floor', 'REDLINE // REX', 'OVERDRIVE'
    elseif key == 'neon run' or key == 'neon-run' then
        return 'neon-run-bg', 'neon-run-floor', 'NEON // NOVA', 'NEON RUN'
    end
    return 'breakout-bg', 'breakout-floor', 'BREAKOUT // KAI VS REX', 'BREAKOUT'
end

function onCreate()
    local bgName, floorName, title, mode = getVisualTheme()

    makeLuaSprite('breakoutBG', bgName, -640, -360)
    setScrollFactor('breakoutBG', 0.0, 0.0)
    scaleObject('breakoutBG', 1.0, 1.0)
    addLuaSprite('breakoutBG', false)

    makeLuaSprite('breakoutFloor', floorName, -640, 365)
    setScrollFactor('breakoutFloor', 0.2, 0.2)
    addLuaSprite('breakoutFloor', false)

    makeLuaText('breakoutTitle', title, 620, 28, 20)
    setTextAlignment('breakoutTitle', 'left')
    setTextSize('breakoutTitle', 24)
    setTextBorder('breakoutTitle', 2, '000000')
    addLuaText('breakoutTitle')

    makeLuaText('breakoutSub', 'MOBILE BUILD  •  0.3.0  •  ' .. mode, 560, 28, 50)
    setTextAlignment('breakoutSub', 'left')
    setTextSize('breakoutSub', 12)
    setTextBorder('breakoutSub', 1, '000000')
    addLuaText('breakoutSub')

    setProperty('camHUD.alpha', 0)
    doTweenAlpha('hudIn', 'camHUD', 1, 0.65, 'quadOut')
end

function onBeatHit()
    local beat = curBeat % 4
    if beat == 0 then
        setProperty('breakoutFloor.alpha', 0.88)
        doTweenAlpha('floorReturn', 'breakoutFloor', 0.58, 0.22, 'quadOut')
        setProperty('camGame.zoom', defaultCamZoom + 0.025)
    elseif beat == 2 then
        setProperty('breakoutFloor.alpha', 0.72)
        doTweenAlpha('floorReturn2', 'breakoutFloor', 0.58, 0.22, 'quadOut')
        setProperty('camGame.zoom', defaultCamZoom + 0.012)
    end
end

function onUpdate(elapsed)
    local pulse = 1 + math.sin(getSongPosition() / 220) * 0.012
    setProperty('breakoutTitle.scale.x', pulse)
    setProperty('breakoutTitle.scale.y', pulse)

    local baseZoom = defaultCamZoom
    local currentZoom = getProperty('camGame.zoom')
    if currentZoom > baseZoom then
        setProperty('camGame.zoom', currentZoom - (elapsed * 0.045))
    end
end
