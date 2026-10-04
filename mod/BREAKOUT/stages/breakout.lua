function onCreate()
    makeLuaSprite('breakoutBG', 'breakout-bg', -640, -360)
    setScrollFactor('breakoutBG', 0.0, 0.0)
    scaleObject('breakoutBG', 1.0, 1.0)
    addLuaSprite('breakoutBG', false)

    makeLuaSprite('breakoutFloor', 'breakout-floor', -640, 365)
    setScrollFactor('breakoutFloor', 0.2, 0.2)
    addLuaSprite('breakoutFloor', false)

    makeLuaText('breakoutTitle', 'BREAKOUT // KAI VS REX', 620, 28, 20)
    setTextAlignment('breakoutTitle', 'left')
    setTextSize('breakoutTitle', 24)
    setTextBorder('breakoutTitle', 2, '000000')
    addLuaText('breakoutTitle')

    makeLuaText('breakoutSub', 'MOBILE PROTOTYPE  •  0.2.0', 420, 28, 50)
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
        setProperty('breakoutFloor.alpha', 0.85)
        doTweenAlpha('floorReturn', 'breakoutFloor', 0.58, 0.22, 'quadOut')
    elseif beat == 2 then
        setProperty('breakoutFloor.alpha', 0.72)
        doTweenAlpha('floorReturn2', 'breakoutFloor', 0.58, 0.22, 'quadOut')
    end
end

function onUpdate(elapsed)
    local pulse = 1 + math.sin(getSongPosition() / 220) * 0.012
    setProperty('breakoutTitle.scale.x', pulse)
    setProperty('breakoutTitle.scale.y', pulse)
end
