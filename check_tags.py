
import re

def check_balance(filename):
    with open(filename, 'r') as f:
        content = f.read()

    # Remove comments
    content = re.sub(r'{/\*.*?\*/}', '', content, flags=re.DOTALL)
    content = re.sub(r'//.*', '', content)

    # Find all tags
    # This regex is a simplification and might not catch all edge cases, but good for a quick check
    # It looks for <Tag ...> or </Tag> or <Tag ... />
    tags = re.finditer(r'<(/?)(\w+)([^>]*?)(/?)>', content)

    stack = []
    
    # Ignore these void elements if they appear (HTML ones, though in RN we usually don't have them except in WebView or strings)
    # But wait, this file has some HTML strings in backticks. We should ignore those.
    
    # Let's strip out the backtick strings first
    content = re.sub(r'`[^`]*`', '``', content, flags=re.DOTALL)

    # Re-run finditer on cleaned content
    tags = re.finditer(r'<(/?)(\w+)([^>]*?)(/?)>', content)

    for match in tags:
        is_closing = match.group(1) == '/'
        tag_name = match.group(2)
        is_self_closing = match.group(4) == '/'

        # In JSX, if it's self closing <Tag />, we ignore it for balance
        if is_self_closing:
            continue

        if not is_closing:
            stack.append((tag_name, match.start()))
        else:
            if not stack:
                print(f"Error: Unexpected closing tag </{tag_name}> at index {match.start()}")
                return

            last_tag, last_pos = stack.pop()
            if last_tag != tag_name:
                print(f"Error: Expected closing tag </{last_tag}> (opened at {last_pos}) but found </{tag_name}> at index {match.start()}")
                # Put it back to continue checking? No, usually this is the error.
                return

    if stack:
        print(f"Error: Unclosed tags: {stack}")
    else:
        print("Tags are balanced.")

check_balance('/Users/dsmac/AL/app/incidenthistory.tsx')
