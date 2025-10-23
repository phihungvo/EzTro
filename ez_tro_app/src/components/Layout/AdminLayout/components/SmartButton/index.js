import { Button } from 'antd';

function SmartButton({
    size = 'middle', // large | middle | small
    type = '',
    title = '',
    // href = '',
    buttonWidth = 120,
    buttonHeight = 38,
    icon = null,
    onClick
}) {
    return (
            <Button
                size={size}
                type={type}
                icon={icon}
                onClick={onClick}
                // {...(href ? { href } : {})}
                style={{ width: buttonWidth, height: buttonHeight}}                
            >
                {title}
            </Button> 
    );
}

export default SmartButton;
