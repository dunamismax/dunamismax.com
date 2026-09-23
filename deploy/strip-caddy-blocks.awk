# Remove the top-level `dunamismax.com {` and `www.dunamismax.com {` site
# blocks (and one blank line after each) from a Caddyfile. Blocks close with
# a `}` in column one; nested braces are indented. Other sites are untouched.
# Exits 3 if a block never closes.
function is_site_header(line) {
    return line ~ /^(www\.)?dunamismax\.com[ \t]*\{[ \t]*$/
}
{
    if (skipping) {
        if ($0 ~ /^\}[ \t]*$/) {
            skipping = 0
            eat_blank = 1
        }
        next
    }
    if (is_site_header($0)) {
        skipping = 1
        next
    }
    if (eat_blank && $0 ~ /^[ \t]*$/) {
        eat_blank = 0
        next
    }
    eat_blank = 0
    print
}
END {
    if (skipping) {
        exit 3
    }
}
