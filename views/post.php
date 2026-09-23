<article aria-labelledby="post-title">
    <header class="page-hero">
        <div class="section-inner">
            <div class="post-detail">
                <p class="eyebrow"><a href="/blog">Blog</a></p>
                <h1 id="post-title"><?= e($post['title']) ?></h1>
<?php if ($post['excerpt'] !== ''): ?>
                <p class="lede"><?= e($post['excerpt']) ?></p>
<?php endif; ?>
                <p class="post-detail__meta">
                    <time datetime="<?= e((new DateTimeImmutable($post['published_at']))->format('Y-m-d')) ?>"><?= e(short_date($post['published_at'])) ?></time>
                    <span><?= e(reading_minutes($post['body'])) ?> min read</span>
                </p>
            </div>
        </div>
    </header>
    <div class="page-section">
        <div class="section-inner">
            <div class="post-detail">
                <div class="post-body">
<?= paragraphs($post['body']) ?>
                </div>
                <p class="section-foot"><a href="/blog" class="section-link">Back to all posts</a></p>
            </div>
        </div>
    </div>
</article>
