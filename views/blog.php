<section class="page-hero" aria-labelledby="blog-title">
    <div class="section-inner">
        <p class="eyebrow">Blog</p>
        <h1 id="blog-title">Notes from shipping software.</h1>
        <p class="lede">Build logs, design notes, and server notes from PHP web work, Python scripting, and self-hosted operations.</p>
    </div>
</section>
<section class="page-section">
    <div class="section-inner">
<?php if ($posts === []): ?>
        <section class="empty-state" aria-labelledby="empty-title">
            <p class="eyebrow">No posts yet.</p>
            <h2 id="empty-title">The blog route is ready.</h2>
            <p>Published posts will render here and in the RSS feed. Drafts stay private until they are published.</p>
            <a href="/projects" class="section-link">Browse current projects</a>
        </section>
<?php else: ?>
        <ul class="card-list">
<?php foreach ($posts as $item): ?>
            <li>
                <a href="/blog/<?= e($item['slug']) ?>" class="post-card">
                    <span class="post-card__meta"><time datetime="<?= e((new DateTimeImmutable($item['published_at']))->format('Y-m-d')) ?>"><?= e(short_date($item['published_at'])) ?></time> · <?= e(reading_minutes($item['body'])) ?> min read</span>
                    <span class="post-card__title"><?= e($item['title']) ?></span>
<?php if ($item['excerpt'] !== ''): ?>
                    <span class="post-card__description"><?= e($item['excerpt']) ?></span>
<?php endif; ?>
                </a>
            </li>
<?php endforeach; ?>
        </ul>
<?php if ($pages > 1): ?>
        <nav class="pagination" aria-label="Blog pages">
<?php if ($page > 1): ?>
            <a href="/blog<?= $page > 2 ? '?page=' . e($page - 1) : '' ?>" class="section-link">Newer posts</a>
<?php endif; ?>
            <span>Page <?= e($page) ?> of <?= e($pages) ?></span>
<?php if ($page < $pages): ?>
            <a href="/blog?page=<?= e($page + 1) ?>" class="section-link">Older posts</a>
<?php endif; ?>
        </nav>
<?php endif; ?>
<?php endif; ?>
    </div>
</section>
